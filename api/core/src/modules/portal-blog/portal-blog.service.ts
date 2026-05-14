import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PortalBlogRepository } from './portal-blog.repository';
import { ZahabService } from '../zahab/zahab.service';
import { ModerationService } from '../moderation/moderation.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ModerationStatus } from '@prisma/client';

@Injectable()
export class PortalBlogService {
  constructor(
    private readonly repo: PortalBlogRepository,
    private readonly zahab: ZahabService,
    @Inject(forwardRef(() => ModerationService))
    private readonly moderation: ModerationService,
  ) {}

  // ── Public ──────────────────────────────────────────────────────────────────

  getPublished(take = 20, skip = 0) {
    return this.repo.findPublished(take, skip);
  }

  async getBySlug(slug: string) {
    const article = await this.repo.findBySlug(slug);
    if (!article || article.status !== 'PUBLISHED' || article.moderationStatus !== ModerationStatus.APPROVED) {
      throw new NotFoundException('Article introuvable');
    }
    // Incrémenter les vues + vérifier milestones (fire-and-forget)
    this.incrementViewsAndCheckMilestones(article.id, article.viewCount + 1, article.authorId, article.milestone100, article.milestone1k).catch(() => {});
    return article;
  }

  private async incrementViewsAndCheckMilestones(
    articleId: string,
    newCount: number,
    authorId: string | null,
    milestone100: boolean,
    milestone1k: boolean,
  ) {
    await this.repo.incrementViewCount(articleId);

    if (authorId) {
      if (!milestone100 && newCount >= 100) {
        await this.repo.setMilestone100(articleId);
        await this.repo.markZahabRewarded(articleId, 10);
        await this.zahab.onArticleMilestone(authorId, articleId, '100');
      } else if (!milestone1k && newCount >= 1000) {
        await this.repo.setMilestone1k(articleId);
        await this.repo.markZahabRewarded(articleId, 50);
        await this.zahab.onArticleMilestone(authorId, articleId, '1k');
      }
    }
  }

  // ── Auteur ──────────────────────────────────────────────────────────────────

  async create(dto: CreateArticleDto, authorId: string) {
    const filter = await this.moderation.filterContent(dto.content);
    if (!filter.allowed) {
      throw new BadRequestException(filter.reason ?? 'Contenu non autorisé');
    }
    return this.repo.create({ ...dto, authorId });
  }

  async update(id: string, dto: UpdateArticleDto, authorId: string) {
    const article = await this.repo.findById(id);
    if (!article) throw new NotFoundException('Article introuvable');
    if (article.authorId !== authorId) throw new ForbiddenException();
    await this.repo.update(id, authorId, dto);
    return this.repo.findById(id);
  }

  async remove(id: string, authorId: string) {
    const article = await this.repo.findById(id);
    if (!article) throw new NotFoundException('Article introuvable');
    if (article.authorId !== authorId) throw new ForbiddenException();
    await this.repo.softDelete(id, authorId);
    return { success: true };
  }

  async publish(id: string, authorId: string, trustLevel?: string) {
    const article = await this.repo.findById(id);
    if (!article) throw new NotFoundException('Article introuvable');
    if (article.authorId !== authorId) throw new ForbiddenException();

    const filter = await this.moderation.filterContent(article.content);
    if (!filter.allowed) {
      throw new BadRequestException(filter.reason ?? 'Contenu non autorisé');
    }

    const resolvedTrust = trustLevel ?? await this.zahab.getTrustLevel(authorId);
    const autoApprove = filter.action !== 'flag' && ['TRUSTED', 'VETERAN', 'GUARDIAN'].includes(resolvedTrust);
    await this.repo.submit(id, authorId, autoApprove ? 'APPROVED' : 'PENDING');

    // Récompense ZAHAB fire-and-forget — uniquement si modération APPROVED
    // Pour les TRUSTED+, le post passe directement APPROVED
    const updated = await this.repo.findById(id);
    if (updated?.moderationStatus === ModerationStatus.APPROVED && !updated.zahabRewarded) {
      await this.repo.markZahabRewarded(id, 20);
      this.zahab.onArticlePublished(authorId, id).catch(() => {});
    }

    return updated;
  }

  getMyArticles(authorId: string) {
    return this.repo.findMyArticles(authorId);
  }

  getMyStats(authorId: string) {
    return this.repo.getMyStats(authorId);
  }
}
