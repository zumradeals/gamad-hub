import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { PageStatus, PageProductType } from '@prisma/client';

const PAGE_SUMMARY = {
  id: true, name: true, slug: true, tagline: true,
  logoUrl: true, coverUrl: true, category: true,
  country: true, city: true, status: true, followCount: true, createdAt: true,
  cell: { select: { id: true, name: true, slug: true, status: true, type: true } },
  _count: { select: { posts: true, products: true, followers: true } },
};

const PAGE_DETAIL = {
  ...PAGE_SUMMARY,
  description: true, website: true, email: true,
  posts: {
    where: { /* all */ },
    orderBy: { createdAt: 'desc' as const },
    take: 5,
  },
  products: {
    where: { available: true },
    orderBy: { createdAt: 'desc' as const },
    take: 12,
  },
};

@Injectable()
export class PortalPagesRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ── Listing ── */

  findAll(opts: { skip?: number; take?: number; category?: string; search?: string }) {
    const where: any = { status: PageStatus.ACTIVE };
    if (opts.category) where.category = opts.category;
    if (opts.search) {
      where.OR = [
        { name: { contains: opts.search, mode: 'insensitive' } },
        { tagline: { contains: opts.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.zumaraPage.findMany({
      where,
      select: PAGE_SUMMARY,
      orderBy: { followCount: 'desc' },
      skip: opts.skip ?? 0,
      take: opts.take ?? 20,
    });
  }

  count(opts: { category?: string; search?: string }) {
    const where: any = { status: PageStatus.ACTIVE };
    if (opts.category) where.category = opts.category;
    if (opts.search) {
      where.OR = [
        { name: { contains: opts.search, mode: 'insensitive' } },
        { tagline: { contains: opts.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.zumaraPage.count({ where });
  }

  /* ── Single page ── */

  findBySlug(slug: string) {
    return this.prisma.zumaraPage.findUnique({ where: { slug }, select: PAGE_DETAIL });
  }

  findById(id: string) {
    return this.prisma.zumaraPage.findUnique({ where: { id } });
  }

  findByCellId(cellId: string) {
    return this.prisma.zumaraPage.findUnique({ where: { cellId } });
  }

  /* ── Create / update ── */

  create(data: {
    cellId: string; name: string; slug: string; tagline?: string;
    description?: string; category?: string; email?: string; country?: string; city?: string;
  }) {
    return this.prisma.zumaraPage.create({ data, select: PAGE_SUMMARY });
  }

  update(id: string, data: Partial<{
    name: string; tagline: string; description: string; category: string;
    logoUrl: string; coverUrl: string; website: string; email: string; country: string; city: string;
  }>) {
    return this.prisma.zumaraPage.update({ where: { id }, data, select: PAGE_SUMMARY });
  }

  /* ── Follow / unfollow ── */

  findFollow(pageId: string, gamadId: string) {
    return this.prisma.zumaraPageFollow.findUnique({
      where: { pageId_gamadId: { pageId, gamadId } },
    });
  }

  async toggleFollow(pageId: string, gamadId: string) {
    const existing = await this.findFollow(pageId, gamadId);
    if (existing) {
      await this.prisma.zumaraPageFollow.delete({
        where: { pageId_gamadId: { pageId, gamadId } },
      });
      await this.prisma.zumaraPage.update({
        where: { id: pageId },
        data: { followCount: { decrement: 1 } },
      });
      return { action: 'unfollowed' };
    }
    await this.prisma.zumaraPageFollow.create({ data: { pageId, gamadId } });
    await this.prisma.zumaraPage.update({
      where: { id: pageId },
      data: { followCount: { increment: 1 } },
    });
    return { action: 'followed' };
  }

  findFollowerIds(pageId: string) {
    return this.prisma.zumaraPageFollow.findMany({
      where: { pageId },
      select: { gamadId: true },
    });
  }

  /* ── Posts ── */

  findPosts(pageId: string, skip: number, take: number) {
    return this.prisma.zumaraPagePost.findMany({
      where: { pageId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  countPosts(pageId: string) {
    return this.prisma.zumaraPagePost.count({ where: { pageId } });
  }

  createPost(pageId: string, data: { content: string; imageUrl?: string }) {
    return this.prisma.zumaraPagePost.create({ data: { pageId, ...data } });
  }

  deletePost(postId: string, pageId: string) {
    return this.prisma.zumaraPagePost.deleteMany({ where: { id: postId, pageId } });
  }

  /* ── Products ── */

  findProducts(pageId: string) {
    return this.prisma.zumaraPageProduct.findMany({
      where: { pageId },
      orderBy: [{ available: 'desc' }, { createdAt: 'desc' }],
    });
  }

  findProductById(id: string) {
    return this.prisma.zumaraPageProduct.findUnique({ where: { id } });
  }

  createProduct(pageId: string, data: {
    name: string; description?: string; imageUrl?: string;
    price?: number; currency?: string; type?: PageProductType; available?: boolean;
  }) {
    return this.prisma.zumaraPageProduct.create({ data: { pageId, ...data } });
  }

  updateProduct(id: string, pageId: string, data: Partial<{
    name: string; description: string; imageUrl: string;
    price: number; currency: string; available: boolean;
  }>) {
    return this.prisma.zumaraPageProduct.updateMany({ where: { id, pageId }, data });
  }

  deleteProduct(id: string, pageId: string) {
    return this.prisma.zumaraPageProduct.deleteMany({ where: { id, pageId } });
  }
}
