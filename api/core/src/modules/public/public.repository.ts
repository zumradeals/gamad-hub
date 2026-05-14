import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ArticleStatus, VideoStatus, FormationStatus, DocumentStatus, DocumentClassification } from '@prisma/client';

@Injectable()
export class PublicRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── Articles ──────────────────────────────────────────────────────────────

  findArticleCategories() {
    return this.prisma.articleCategory.findMany({ orderBy: { name: 'asc' } });
  }

  findPublishedArticles(opts?: { categorySlug?: string; skip?: number; take?: number }) {
    return this.prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        ...(opts?.categorySlug
          ? { category: { slug: opts.categorySlug } }
          : {}),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        imageUrl: true,
        publishedAt: true,
        category: { select: { name: true, slug: true } },
      },
      orderBy: { publishedAt: 'desc' },
      skip: opts?.skip ?? 0,
      take: opts?.take ?? 20,
    });
  }

  findArticleBySlug(slug: string) {
    return this.prisma.article.findUnique({
      where: { slug, status: ArticleStatus.PUBLISHED },
      include: { category: { select: { name: true, slug: true } } },
    });
  }

  // ── Videos ────────────────────────────────────────────────────────────────

  findVideoCategories() {
    return this.prisma.videoCategory.findMany({ orderBy: { name: 'asc' } });
  }

  findPublishedVideos(opts?: { categorySlug?: string; skip?: number; take?: number }) {
    return this.prisma.video.findMany({
      where: {
        status: VideoStatus.PUBLISHED,
        ...(opts?.categorySlug
          ? { category: { slug: opts.categorySlug } }
          : {}),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        thumbnailUrl: true,
        duration: true,
        publishedAt: true,
        category: { select: { name: true, slug: true } },
      },
      orderBy: { publishedAt: 'desc' },
      skip: opts?.skip ?? 0,
      take: opts?.take ?? 20,
    });
  }

  findVideoBySlug(slug: string) {
    return this.prisma.video.findUnique({
      where: { slug, status: VideoStatus.PUBLISHED },
      include: { category: { select: { name: true, slug: true } } },
    });
  }

  // ── Formations ────────────────────────────────────────────────────────────

  findPublicFormations(opts?: { skip?: number; take?: number }) {
    return this.prisma.formation.findMany({
      where: { isPublic: true, status: FormationStatus.PUBLISHED },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        imageUrl: true,
        createdAt: true,
        _count: { select: { modules: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: opts?.skip ?? 0,
      take: opts?.take ?? 20,
    });
  }

  findPublicFormationBySlug(slug: string) {
    return this.prisma.formation.findUnique({
      where: { slug, isPublic: true, status: FormationStatus.PUBLISHED },
      include: {
        modules: {
          select: { id: true, title: true, order: true, duration: true },
          orderBy: { order: 'asc' },
        },
        _count: { select: { modules: true, enrollments: true } },
      },
    });
  }

  // ── Resources (public documents) ──────────────────────────────────────────

  findPublicDocuments(opts?: { skip?: number; take?: number }) {
    return this.prisma.document.findMany({
      where: {
        classification: DocumentClassification.PUBLIC,
        status: DocumentStatus.VALIDATED,
      },
      select: {
        id: true,
        title: true,
        documentType: true,
        createdAt: true,
        updatedAt: true,
        organizationUnit: { select: { name: true } },
        _count: { select: { versions: true } },
      },
      orderBy: { updatedAt: 'desc' },
      skip: opts?.skip ?? 0,
      take: opts?.take ?? 20,
    });
  }

  // ── Admin: Articles ───────────────────────────────────────────────────────

  createArticle(data: {
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    imageUrl?: string;
    categoryId?: string;
  }) {
    return this.prisma.article.create({ data, include: { category: true } });
  }

  updateArticleStatus(id: string, status: ArticleStatus) {
    return this.prisma.article.update({
      where: { id },
      data: { status, publishedAt: status === ArticleStatus.PUBLISHED ? new Date() : undefined },
    });
  }

  // ── Admin: Videos ─────────────────────────────────────────────────────────

  createVideo(data: {
    title: string;
    slug: string;
    description?: string;
    thumbnailUrl?: string;
    videoUrl?: string;
    duration?: number;
    categoryId?: string;
  }) {
    return this.prisma.video.create({ data, include: { category: true } });
  }

  updateVideoStatus(id: string, status: VideoStatus) {
    return this.prisma.video.update({
      where: { id },
      data: { status, publishedAt: status === VideoStatus.PUBLISHED ? new Date() : undefined },
    });
  }

  // ── G-SEARCH ──────────────────────────────────────────────────────────────

  async search(q: string, skip = 0, take = 20) {
    const contains = { contains: q, mode: 'insensitive' as const };

    const [articles, videos, formations, resources] = await Promise.all([
      this.prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED, OR: [{ title: contains }, { excerpt: contains }] },
        select: { id: true, title: true, slug: true, excerpt: true, imageUrl: true, publishedAt: true },
        orderBy: { publishedAt: 'desc' },
        take,
      }),
      this.prisma.video.findMany({
        where: { status: VideoStatus.PUBLISHED, OR: [{ title: contains }, { description: contains }] },
        select: { id: true, title: true, slug: true, description: true, thumbnailUrl: true, publishedAt: true },
        orderBy: { publishedAt: 'desc' },
        take,
      }),
      this.prisma.formation.findMany({
        where: { isPublic: true, status: FormationStatus.PUBLISHED, OR: [{ title: contains }, { description: contains }] },
        select: { id: true, title: true, slug: true, description: true, imageUrl: true },
        take,
      }),
      this.prisma.document.findMany({
        where: { classification: DocumentClassification.PUBLIC, status: DocumentStatus.VALIDATED, title: contains },
        select: { id: true, title: true, documentType: true, updatedAt: true },
        take,
      }),
    ]);

    return { articles, videos, formations, resources };
  }
}
