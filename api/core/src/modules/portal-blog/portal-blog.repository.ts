import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ArticleStatus, ModerationStatus } from '@prisma/client';

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
}

async function uniqueSlug(prisma: PrismaService, base: string): Promise<string> {
  let slug = slugify(base);
  let suffix = 0;
  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const exists = await prisma.article.findUnique({ where: { slug: candidate } });
    if (!exists) return candidate;
    suffix++;
  }
}

@Injectable()
export class PortalBlogRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── Public ──────────────────────────────────────────────────────────────────

  findPublished(take = 20, skip = 0) {
    return this.prisma.article.findMany({
      where: { status: ArticleStatus.PUBLISHED, moderationStatus: ModerationStatus.APPROVED },
      orderBy: { publishedAt: 'desc' },
      take,
      skip,
      include: { category: true },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.article.findUnique({
      where: { slug },
      include: { category: true, author: { include: { profile: true } } },
    });
  }

  async incrementViewCount(id: string) {
    return this.prisma.article.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }

  async setMilestone100(id: string) {
    return this.prisma.article.update({ where: { id }, data: { milestone100: true } });
  }

  async setMilestone1k(id: string) {
    return this.prisma.article.update({ where: { id }, data: { milestone1k: true } });
  }

  // ── Auteur ──────────────────────────────────────────────────────────────────

  async create(data: {
    title: string;
    content: string;
    excerpt?: string;
    imageUrl?: string;
    categoryId?: string;
    authorId: string;
  }) {
    const slug = await uniqueSlug(this.prisma, data.title);
    return this.prisma.article.create({
      data: {
        ...data,
        slug,
        status: ArticleStatus.DRAFT,
        moderationStatus: ModerationStatus.PENDING,
      },
    });
  }

  async update(id: string, authorId: string, data: Partial<{ title: string; content: string; excerpt: string; imageUrl: string; categoryId: string }>) {
    return this.prisma.article.updateMany({
      where: { id, authorId },
      data,
    });
  }

  async softDelete(id: string, authorId: string) {
    return this.prisma.article.updateMany({
      where: { id, authorId },
      data: { status: ArticleStatus.ARCHIVED },
    });
  }

  async submit(id: string, authorId: string, moderationStatus: ModerationStatus = ModerationStatus.PENDING) {
    return this.prisma.article.updateMany({
      where: {
        id,
        authorId,
        status: { in: [ArticleStatus.DRAFT] },
      },
      data: {
        status: ArticleStatus.PUBLISHED,
        publishedAt: new Date(),
        moderationStatus,
      },
    });
  }

  findMyArticles(authorId: string) {
    return this.prisma.article.findMany({
      where: { authorId },
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
  }

  async getMyStats(authorId: string) {
    const articles = await this.prisma.article.findMany({
      where: { authorId, status: ArticleStatus.PUBLISHED, moderationStatus: ModerationStatus.APPROVED },
    });

    const totalViews = articles.reduce((sum, a) => sum + a.viewCount, 0);
    const totalZahab = articles.reduce((sum, a) => sum + a.rewardAmount, 0);
    const totalPublished = articles.length;
    const avgViews = totalPublished > 0 ? Math.round(totalViews / totalPublished) : 0;

    return { totalViews, totalZahab, totalPublished, avgViews };
  }

  findById(id: string) {
    return this.prisma.article.findUnique({ where: { id } });
  }

  async markZahabRewarded(id: string, rewardAmount: number) {
    return this.prisma.article.update({
      where: { id },
      data: { zahabRewarded: true, rewardAmount: { increment: rewardAmount } },
    });
  }
}
