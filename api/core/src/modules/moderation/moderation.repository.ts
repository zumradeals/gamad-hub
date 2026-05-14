import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ModerationStatus, ReportReason, ReportStatus } from '@prisma/client';

@Injectable()
export class ModerationRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── File de modération ────────────────────────────────────────────────────────

  getPendingPosts() {
    return this.prisma.portalFeedPost.findMany({
      where: { moderationStatus: ModerationStatus.PENDING },
      orderBy: { createdAt: 'asc' },
      include: { gamad: { include: { profile: true } } },
      take: 50,
    });
  }

  getPendingArticles() {
    return this.prisma.article.findMany({
      where: { moderationStatus: ModerationStatus.PENDING, status: 'PUBLISHED' },
      orderBy: { publishedAt: 'asc' },
      include: { author: { include: { profile: true } } },
      take: 50,
    });
  }

  async approvePost(id: string) {
    return this.prisma.portalFeedPost.update({
      where: { id },
      data: { moderationStatus: ModerationStatus.APPROVED },
    });
  }

  async rejectPost(id: string) {
    return this.prisma.portalFeedPost.update({
      where: { id },
      data: { moderationStatus: ModerationStatus.REJECTED },
    });
  }

  async approveArticle(id: string) {
    return this.prisma.article.update({
      where: { id },
      data: { moderationStatus: ModerationStatus.APPROVED },
    });
  }

  async rejectArticle(id: string) {
    return this.prisma.article.update({
      where: { id },
      data: { moderationStatus: ModerationStatus.REJECTED },
    });
  }

  findQueueItem(id: string, type: 'post' | 'article') {
    if (type === 'post') {
      return this.prisma.portalFeedPost.findUnique({ where: { id } });
    }
    return this.prisma.article.findUnique({ where: { id } });
  }

  // ── Signalements ─────────────────────────────────────────────────────────────

  async createReport(data: {
    reporterId: string;
    contentId: string;
    contentType: string;
    reason: ReportReason;
    note?: string;
  }) {
    return this.prisma.contentReport.create({ data });
  }

  findExistingReport(reporterId: string, contentId: string, contentType: string) {
    return this.prisma.contentReport.findUnique({
      where: { reporterId_contentId_contentType: { reporterId, contentId, contentType } },
    });
  }

  getPendingReports() {
    return this.prisma.contentReport.findMany({
      where: { status: ReportStatus.PENDING },
      orderBy: { createdAt: 'asc' },
      include: { reporter: { include: { profile: true } } },
      take: 100,
    });
  }

  async updateReport(id: string, reviewerId: string, status: ReportStatus, reviewNote?: string) {
    return this.prisma.contentReport.update({
      where: { id },
      data: { status, reviewerId, reviewNote, reviewedAt: new Date() },
    });
  }

  // ── Stats ─────────────────────────────────────────────────────────────────────

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [pendingPosts, pendingArticles, pendingReports, approvedToday, rejectedToday] =
      await Promise.all([
        this.prisma.portalFeedPost.count({ where: { moderationStatus: ModerationStatus.PENDING } }),
        this.prisma.article.count({ where: { moderationStatus: ModerationStatus.PENDING, status: 'PUBLISHED' } }),
        this.prisma.contentReport.count({ where: { status: ReportStatus.PENDING } }),
        this.prisma.portalFeedPost.count({
          where: { moderationStatus: ModerationStatus.APPROVED, updatedAt: { gte: today } },
        }),
        this.prisma.portalFeedPost.count({
          where: { moderationStatus: ModerationStatus.REJECTED, updatedAt: { gte: today } },
        }),
      ]);

    const totalReviewedToday = approvedToday + rejectedToday;
    const approvalRate = totalReviewedToday > 0
      ? Math.round((approvedToday / totalReviewedToday) * 100)
      : null;

    return { pendingPosts, pendingArticles, pendingReports, approvedToday, rejectedToday, approvalRate };
  }

  // ── Filtre de contenu ─────────────────────────────────────────────────────────

  async getFilterRules() {
    return this.prisma.contentFilterRule.findMany({ orderBy: { keyword: 'asc' } });
  }
}
