import { Injectable } from '@nestjs/common';
import { MarketOrderStatus, MarketPaymentMethod, PageProductType, PrismaClient } from '@prisma/client';
import { PrismaService } from '../../prisma.service';

const PRODUCT_WITH_PAGE = {
  id: true, name: true, description: true, imageUrl: true,
  price: true, currency: true, type: true, available: true, createdAt: true,
  page: {
    select: {
      id: true, name: true, slug: true, logoUrl: true,
      category: true, country: true, city: true,
      cell: { select: { id: true } },
    },
  },
};

const ORDER_WITH_PRODUCT = {
  id: true, quantity: true, unitPrice: true, totalPrice: true,
  currency: true, paymentMethod: true, status: true, note: true,
  paymentRef: true, createdAt: true, updatedAt: true,
  product: {
    select: {
      id: true, name: true, imageUrl: true, type: true,
      page: { select: { name: true, slug: true, logoUrl: true } },
    },
  },
};

@Injectable()
export class PortalMarketRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ── Products listing ── */

  findProducts(opts: {
    skip: number; take: number;
    category?: string; country?: string;
    minPrice?: number; maxPrice?: number;
    type?: PageProductType; search?: string;
  }) {
    const where = this.buildWhere(opts);
    return this.prisma.zumaraPageProduct.findMany({
      where,
      select: PRODUCT_WITH_PAGE,
      orderBy: { createdAt: 'desc' },
      skip: opts.skip,
      take: opts.take,
    });
  }

  countProducts(opts: {
    category?: string; country?: string;
    minPrice?: number; maxPrice?: number;
    type?: PageProductType; search?: string;
  }) {
    return this.prisma.zumaraPageProduct.count({ where: this.buildWhere(opts) });
  }

  private buildWhere(opts: {
    category?: string; country?: string;
    minPrice?: number; maxPrice?: number;
    type?: PageProductType; search?: string;
  }) {
    const where: any = {
      available: true,
      page: { status: 'ACTIVE' },
    };
    if (opts.type) where.type = opts.type;
    if (opts.category) where.page = { ...where.page, category: opts.category };
    if (opts.country) where.page = { ...where.page, country: opts.country };
    if (opts.minPrice != null || opts.maxPrice != null) {
      where.price = {};
      if (opts.minPrice != null) where.price.gte = opts.minPrice;
      if (opts.maxPrice != null) where.price.lte = opts.maxPrice;
    }
    if (opts.search) {
      where.OR = [
        { name: { contains: opts.search, mode: 'insensitive' } },
        { description: { contains: opts.search, mode: 'insensitive' } },
        { page: { name: { contains: opts.search, mode: 'insensitive' } } },
      ];
    }
    return where;
  }

  findProductById(id: string) {
    return this.prisma.zumaraPageProduct.findUnique({
      where: { id },
      select: {
        ...PRODUCT_WITH_PAGE,
        page: {
          select: {
            id: true, name: true, slug: true, logoUrl: true, coverUrl: true,
            tagline: true, description: true, category: true,
            country: true, city: true, website: true, email: true,
            followCount: true, _count: { select: { followers: true, products: true } },
            cell: { select: { id: true, slug: true } },
          },
        },
      },
    });
  }

  /* ── Orders ── */

  createOrder(data: {
    productId: string; buyerGamadId: string; quantity: number;
    unitPrice: number; totalPrice: number; currency: string;
    paymentMethod: MarketPaymentMethod; status: MarketOrderStatus;
    note?: string; paymentRef?: string;
  }) {
    return this.prisma.marketOrder.create({ data, select: ORDER_WITH_PRODUCT });
  }

  findMyOrders(buyerGamadId: string) {
    return this.prisma.marketOrder.findMany({
      where: { buyerGamadId },
      select: ORDER_WITH_PRODUCT,
      orderBy: { createdAt: 'desc' },
    });
  }

  findOrderById(id: string, buyerGamadId: string) {
    return this.prisma.marketOrder.findFirst({
      where: { id, buyerGamadId },
      select: ORDER_WITH_PRODUCT,
    });
  }

  /* ── Seller lookup ── */

  findPageFounderGamadId(cellId: string): Promise<string | null> {
    return this.prisma.zumaraCellMembership.findFirst({
      where: { cellId, role: 'FOUNDER', status: 'ACTIVE' },
      select: { gamadId: true },
    }).then((m) => m?.gamadId ?? null);
  }

  findWalletBalance(gamadId: string): Promise<number> {
    return this.prisma.zahabWallet.findUnique({ where: { gamadId } })
      .then((w) => w?.balance ?? 0);
  }
}
