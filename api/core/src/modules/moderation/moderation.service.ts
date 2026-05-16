import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ModerationRepository } from './moderation.repository';
import { ZahabService } from '../zahab/zahab.service';
import { PrismaService } from '../../prisma.service';
import { ReportReason, ReportStatus, FilterSeverity } from '@prisma/client';

@Injectable()
export class ModerationService {
  private filterCache: { keyword: string; severity: FilterSeverity }[] = [];
  private filterCacheAt = 0;

  constructor(
    private readonly repo: ModerationRepository,
    private readonly zahab: ZahabService,
    private readonly prisma: PrismaService,
  ) {}

  // ── Filtre de contenu ─────────────────────────────────────────────────────────

  async filterContent(text: string): Promise<{ allowed: boolean; action: 'ok' | 'block' | 'flag'; reason?: string }> {
    // Rafraîchir le cache toutes les 5 minutes
    if (Date.now() - this.filterCacheAt > 300_000) {
      this.filterCache = await this.repo.getFilterRules();
      this.filterCacheAt = Date.now();
    }

    const lower = text.toLowerCase();
    for (const rule of this.filterCache) {
      if (lower.includes(rule.keyword.toLowerCase())) {
        if (rule.severity === FilterSeverity.BLOCK) {
          return { allowed: false, action: 'block', reason: `Contenu non autorisé (mot interdit détecté)` };
        }
        return { allowed: true, action: 'flag', reason: rule.keyword };
      }
    }
    return { allowed: true, action: 'ok' };
  }

  // ── File de modération ────────────────────────────────────────────────────────

  getQueue() {
    return Promise.all([this.repo.getPendingPosts(), this.repo.getPendingArticles()]).then(
      ([posts, articles]) => ({ posts, articles }),
    );
  }

  async review(id: string, reviewerId: string, approve: boolean, note?: string, type: 'post' | 'article' = 'post') {
    const item = await this.repo.findQueueItem(id, type);
    if (!item) throw new NotFoundException('Contenu introuvable');

    const authorId = type === 'post' ? (item as any).gamadId : (item as any).authorId;

    // Un modérateur ne peut pas modérer ses propres contenus
    if (authorId === reviewerId) throw new ForbiddenException('Impossible de modérer son propre contenu');

    if (approve) {
      if (type === 'post') {
        await this.repo.approvePost(id);
        // Récompense ZAHAB si pas encore reçue
        if (!(item as any).zahabRewarded && authorId) {
          this.zahab.onContentPublished(authorId, id).catch(() => {});
          await this.prisma.portalFeedPost.update({ where: { id }, data: { zahabRewarded: true } });
        }
      } else {
        await this.repo.approveArticle(id);
        if (!(item as any).zahabRewarded && authorId) {
          this.zahab.onArticlePublished(authorId, id).catch(() => {});
          await this.prisma.article.update({ where: { id }, data: { zahabRewarded: true, rewardAmount: { increment: 20 } } });
        }
      }
    } else {
      if (type === 'post') await this.repo.rejectPost(id);
      else await this.repo.rejectArticle(id);
      // Pénalité réputation (fire-and-forget)
      if (authorId) this.zahab.onContentRejected(authorId).catch(() => {});
    }

    // AuditEvent (fire-and-forget)
    this.prisma.auditEvent.create({
      data: {
        actorId: reviewerId,
        action: approve ? 'MODERATION_APPROVED' : 'MODERATION_REJECTED',
        targetType: type === 'post' ? 'PortalFeedPost' : 'Article',
        targetId: id,
        newValue: { note, approve },
      },
    }).catch(() => {});

    return { success: true, action: approve ? 'approved' : 'rejected' };
  }

  // ── Signalements ─────────────────────────────────────────────────────────────

  async report(reporterId: string, contentId: string, contentType: string, reason: ReportReason, note?: string) {
    const existing = await this.repo.findExistingReport(reporterId, contentId, contentType);
    if (existing) throw new ConflictException('Vous avez déjà signalé ce contenu');

    const report = await this.repo.createReport({ reporterId, contentId, contentType, reason, note });

    // AuditEvent
    this.prisma.auditEvent.create({
      data: {
        actorId: reporterId,
        action: 'CONTENT_REPORTED',
        targetType: contentType,
        targetId: contentId,
        newValue: { reason, note },
      },
    }).catch(() => {});

    return report;
  }

  getReports() {
    return this.repo.getPendingReports();
  }

  async handleReport(reportId: string, reviewerId: string, validated: boolean, reviewNote?: string) {
    const report = await this.prisma.contentReport.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Signalement introuvable');

    const status = validated ? ReportStatus.VALIDATED : ReportStatus.DISMISSED;
    await this.repo.updateReport(reportId, reviewerId, status, reviewNote);

    if (validated) {
      // Pénalité à l'auteur du contenu signalé
      const authorId = await this.getContentAuthor(report.contentId, report.contentType);
      if (authorId) this.zahab.onContentReported(authorId).catch(() => {});

      // Flaguer le contenu si ≥ 3 signalements validés
      const validatedCount = await this.prisma.contentReport.count({
        where: { contentId: report.contentId, contentType: report.contentType, status: ReportStatus.VALIDATED },
      });
      if (validatedCount >= 3) {
        await this.flagContent(report.contentId, report.contentType);
      }
    }

    this.prisma.auditEvent.create({
      data: {
        actorId: reviewerId,
        action: validated ? 'REPORT_VALIDATED' : 'REPORT_DISMISSED',
        targetType: 'ContentReport',
        targetId: reportId,
        newValue: { reviewNote },
      },
    }).catch(() => {});

    return { success: true };
  }

  private async getContentAuthor(contentId: string, contentType: string): Promise<string | null> {
    if (contentType === 'POST') {
      const post = await this.prisma.portalFeedPost.findUnique({ where: { id: contentId } });
      return post?.gamadId ?? null;
    }
    if (contentType === 'ARTICLE') {
      const article = await this.prisma.article.findUnique({ where: { id: contentId } });
      return article?.authorId ?? null;
    }
    return null;
  }

  private async flagContent(contentId: string, contentType: string) {
    if (contentType === 'POST') {
      await this.prisma.portalFeedPost.update({
        where: { id: contentId },
        data: { moderationStatus: 'FLAGGED' },
      });
    } else if (contentType === 'ARTICLE') {
      await this.prisma.article.update({
        where: { id: contentId },
        data: { moderationStatus: 'FLAGGED' },
      });
    }
  }

  getStats() {
    return this.repo.getStats();
  }

  getFilterRules() {
    return this.repo.getFilterRules();
  }

  async addFilterRule(keyword: string, severity: 'FLAG' | 'BLOCK', createdBy: string) {
    const rule = await this.repo.addFilterRule(keyword.toLowerCase().trim(), severity as any, createdBy);
    this.filterCacheAt = 0; // invalider le cache
    return rule;
  }

  async deleteFilterRule(id: string) {
    const result = await this.repo.deleteFilterRule(id);
    this.filterCacheAt = 0; // invalider le cache
    return result;
  }
}
