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

function calcReadingTime(content: string): number {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}

const ARTICLE_SELECT = {
  id: true, title: true, slug: true, excerpt: true, imageUrl: true,
  videoUrl: true, tags: true, sponsored: true, sponsorName: true,
  category: { select: { id: true, name: true, slug: true } },
  status: true, moderationStatus: true, viewCount: true, likesCount: true,
  readRewardCount: true, readingTimeMin: true, publishedAt: true, createdAt: true,
  author: { select: { publicCode: true, profile: { select: { displayName: true, avatarUrl: true } } } },
};

@Injectable()
export class PortalBlogRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ── Listing public ── */

  findPublished(opts: {
    skip: number; take: number;
    category?: string; search?: string;
    sort?: 'recent' | 'popular';
  }) {
    const where: any = {
      status: ArticleStatus.PUBLISHED,
      moderationStatus: ModerationStatus.APPROVED,
    };
    if (opts.category) where.category = { slug: opts.category };
    if (opts.search) {
      where.OR = [
        { title: { contains: opts.search, mode: 'insensitive' } },
        { excerpt: { contains: opts.search, mode: 'insensitive' } },
        { tags: { has: opts.search.toLowerCase() } },
      ];
    }
    const orderBy = opts.sort === 'popular'
      ? [{ viewCount: 'desc' as const }]
      : [{ publishedAt: 'desc' as const }];
    return this.prisma.article.findMany({ where, select: ARTICLE_SELECT, orderBy, skip: opts.skip, take: opts.take });
  }

  countPublished(opts: { category?: string; search?: string }) {
    const where: any = { status: ArticleStatus.PUBLISHED, moderationStatus: ModerationStatus.APPROVED };
    if (opts.category) where.category = { slug: opts.category };
    if (opts.search) where.OR = [{ title: { contains: opts.search, mode: 'insensitive' } }, { excerpt: { contains: opts.search, mode: 'insensitive' } }];
    return this.prisma.article.count({ where });
  }

  findTrending() {
    return this.prisma.article.findMany({
      where: { status: ArticleStatus.PUBLISHED, moderationStatus: ModerationStatus.APPROVED },
      select: ARTICLE_SELECT,
      orderBy: { viewCount: 'desc' },
      take: 5,
    });
  }

  findBySlug(slug: string) {
    return this.prisma.article.findUnique({
      where: { slug },
      include: {
        category: true,
        author: { include: { profile: true } },
        _count: { select: { comments: true, likes: true, reads: true } },
      },
    });
  }

  findById(id: string) {
    return this.prisma.article.findUnique({ where: { id } });
  }

  /* ── Editorial queue ── */

  findPendingReview() {
    return this.prisma.article.findMany({
      where: { status: ArticleStatus.PUBLISHED, moderationStatus: ModerationStatus.PENDING },
      select: { ...ARTICLE_SELECT, content: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  approveArticle(id: string, editorId: string) {
    return this.prisma.article.update({
      where: { id },
      data: { moderationStatus: ModerationStatus.APPROVED, editorId },
    });
  }

  rejectArticle(id: string, editorId: string, note: string) {
    return this.prisma.article.update({
      where: { id },
      data: {
        moderationStatus: ModerationStatus.REJECTED,
        status: ArticleStatus.DRAFT,
        editorId,
        rejectionNote: note,
      },
    });
  }

  /* ── Author CRUD ── */

  async create(data: {
    title: string; content: string; excerpt?: string;
    imageUrl?: string; videoUrl?: string; tags?: string[];
    sponsored?: boolean; sponsorName?: string; sponsorUrl?: string;
    categoryId?: string; authorId: string;
  }) {
    const slug = await uniqueSlug(this.prisma, data.title);
    const readingTimeMin = calcReadingTime(data.content);
    return this.prisma.article.create({
      data: { ...data, slug, readingTimeMin, status: ArticleStatus.DRAFT, moderationStatus: ModerationStatus.PENDING },
      select: ARTICLE_SELECT,
    });
  }

  async update(id: string, authorId: string, data: Partial<{
    title: string; content: string; excerpt: string; imageUrl: string;
    videoUrl: string; tags: string[]; sponsored: boolean;
    sponsorName: string; sponsorUrl: string; categoryId: string;
  }>) {
    const extra: any = {};
    if (data.content) extra.readingTimeMin = calcReadingTime(data.content);
    return this.prisma.article.updateMany({ where: { id, authorId }, data: { ...data, ...extra } });
  }

  async submit(id: string, authorId: string, moderationStatus: ModerationStatus) {
    return this.prisma.article.updateMany({
      where: { id, authorId, status: { in: [ArticleStatus.DRAFT] } },
      data: { status: ArticleStatus.PUBLISHED, publishedAt: new Date(), moderationStatus },
    });
  }

  async softDelete(id: string, authorId: string) {
    return this.prisma.article.updateMany({ where: { id, authorId }, data: { status: ArticleStatus.ARCHIVED } });
  }

  findMyArticles(authorId: string) {
    return this.prisma.article.findMany({
      where: { authorId },
      select: { ...ARTICLE_SELECT, content: false, rejectionNote: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyStats(authorId: string) {
    const articles = await this.prisma.article.findMany({
      where: { authorId, status: ArticleStatus.PUBLISHED, moderationStatus: ModerationStatus.APPROVED },
      select: { viewCount: true, rewardAmount: true, readRewardCount: true, likesCount: true },
    });
    const totalViews = articles.reduce((s, a) => s + a.viewCount, 0);
    const totalZahab = articles.reduce((s, a) => s + a.rewardAmount, 0);
    const totalReads = articles.reduce((s, a) => s + a.readRewardCount, 0);
    return { totalViews, totalZahab, totalPublished: articles.length, totalReads, avgViews: articles.length ? Math.round(totalViews / articles.length) : 0 };
  }

  async markZahabRewarded(id: string, amount: number) {
    return this.prisma.article.update({ where: { id }, data: { zahabRewarded: true, rewardAmount: { increment: amount } } });
  }

  async incrementViewCount(id: string) {
    return this.prisma.article.update({ where: { id }, data: { viewCount: { increment: 1 } } });
  }

  async setMilestone100(id: string) {
    return this.prisma.article.update({ where: { id }, data: { milestone100: true } });
  }

  async setMilestone1k(id: string) {
    return this.prisma.article.update({ where: { id }, data: { milestone1k: true } });
  }

  /* ── Read tracking ── */

  async findRead(articleId: string, gamadId: string) {
    return this.prisma.articleRead.findUnique({ where: { articleId_gamadId: { articleId, gamadId } } });
  }

  async createRead(articleId: string, gamadId: string) {
    return this.prisma.articleRead.create({ data: { articleId, gamadId, rewardedAt: new Date() } });
  }

  async incrementReadReward(articleId: string) {
    return this.prisma.article.update({ where: { id: articleId }, data: { readRewardCount: { increment: 1 } } });
  }

  /* ── Likes ── */

  async findLike(articleId: string, gamadId: string) {
    return this.prisma.articleLike.findUnique({ where: { articleId_gamadId: { articleId, gamadId } } });
  }

  async toggleLike(articleId: string, gamadId: string): Promise<'liked' | 'unliked'> {
    const existing = await this.findLike(articleId, gamadId);
    if (existing) {
      await this.prisma.articleLike.delete({ where: { articleId_gamadId: { articleId, gamadId } } });
      await this.prisma.article.update({ where: { id: articleId }, data: { likesCount: { decrement: 1 } } });
      return 'unliked';
    }
    await this.prisma.articleLike.create({ data: { articleId, gamadId } });
    await this.prisma.article.update({ where: { id: articleId }, data: { likesCount: { increment: 1 } } });
    return 'liked';
  }

  /* ── Comments ── */

  findComments(articleId: string) {
    return this.prisma.articleComment.findMany({
      where: { articleId },
      orderBy: { createdAt: 'asc' },
      include: { gamad: { select: { publicCode: true, profile: { select: { displayName: true, avatarUrl: true } } } } },
    });
  }

  createComment(articleId: string, gamadId: string, content: string) {
    return this.prisma.articleComment.create({
      data: { articleId, gamadId, content },
      include: { gamad: { select: { publicCode: true, profile: { select: { displayName: true, avatarUrl: true } } } } },
    });
  }

  deleteComment(commentId: string, gamadId: string) {
    return this.prisma.articleComment.deleteMany({ where: { id: commentId, gamadId } });
  }

  /* ── Categories ── */

  findCategories() {
    return this.prisma.articleCategory.findMany({ orderBy: { name: 'asc' } });
  }
}
