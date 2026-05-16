import {
  Injectable, NotFoundException, ConflictException,
  ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { PortalPagesRepository } from './portal-pages.repository';
import { PrismaService } from '../../prisma.service';
import { CreatePageDto } from './dto/create-page.dto';
import { CreatePagePostDto } from './dto/create-page-post.dto';
import { CreatePageProductDto } from './dto/create-page-product.dto';

@Injectable()
export class PortalPagesService {
  constructor(
    private readonly repo: PortalPagesRepository,
    private readonly prisma: PrismaService,
  ) {}

  /* ── Listing ── */

  async listPages(page: number, category?: string, search?: string) {
    const take = 20;
    const skip = (page - 1) * take;
    const [pages, total] = await Promise.all([
      this.repo.findAll({ skip, take, category, search }),
      this.repo.count({ category, search }),
    ]);
    return { pages, total, page, pages_count: Math.ceil(total / take) };
  }

  async getPage(slug: string, gamadId?: string) {
    const page = await this.repo.findBySlug(slug);
    if (!page) throw new NotFoundException('Page introuvable');
    let isFollowing = false;
    if (gamadId) {
      const f = await this.repo.findFollow(page.id, gamadId);
      isFollowing = !!f;
    }
    return { ...page, isFollowing };
  }

  /* ── Create ── */

  async createPage(gamadId: string, dto: CreatePageDto) {
    // Verify slug uniqueness
    const existing = await this.prisma.zumaraPage.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('Ce slug est déjà utilisé');

    // Verify the gamadId is FOUNDER/CO_FOUNDER of an ESTABLISHED+ cell
    const membership = await this.prisma.zumaraCellMembership.findFirst({
      where: {
        gamadId,
        role: { in: ['FOUNDER', 'CO_FOUNDER'] },
        status: 'ACTIVE',
        cell: { status: { in: ['ESTABLISHED', 'SATELLITE', 'ELITE'] } },
      },
      include: { cell: { select: { id: true, status: true } } },
    });
    if (!membership) {
      throw new ForbiddenException(
        'Seul le fondateur d\'une Zumara ESTABLISHED peut créer une Page Pro',
      );
    }

    // Check no page exists for this cell yet
    const cellPage = await this.repo.findByCellId(membership.cell.id);
    if (cellPage) throw new ConflictException('Cette Zumara a déjà une Page Pro');

    return this.repo.create({ cellId: membership.cell.id, ...dto });
  }

  async updatePage(slug: string, gamadId: string, data: any) {
    const page = await this.repo.findBySlug(slug);
    if (!page) throw new NotFoundException('Page introuvable');
    await this.assertPageAdmin(page.id, gamadId);
    return this.repo.update(page.id, data);
  }

  /* ── Follow ── */

  async toggleFollow(slug: string, gamadId: string) {
    const page = await this.repo.findBySlug(slug);
    if (!page) throw new NotFoundException('Page introuvable');
    return this.repo.toggleFollow(page.id, gamadId);
  }

  /* ── Posts ── */

  async getPosts(slug: string, page: number) {
    const p = await this.repo.findBySlug(slug);
    if (!p) throw new NotFoundException('Page introuvable');
    const take = 10;
    const skip = (page - 1) * take;
    const [posts, total] = await Promise.all([
      this.repo.findPosts(p.id, skip, take),
      this.repo.countPosts(p.id),
    ]);
    return { posts, total, page, pages: Math.ceil(total / take) };
  }

  async createPost(slug: string, gamadId: string, dto: CreatePagePostDto) {
    const page = await this.repo.findBySlug(slug);
    if (!page) throw new NotFoundException('Page introuvable');
    await this.assertPageAdmin(page.id, gamadId);
    return this.repo.createPost(page.id, dto);
  }

  async deletePost(slug: string, postId: string, gamadId: string) {
    const page = await this.repo.findBySlug(slug);
    if (!page) throw new NotFoundException('Page introuvable');
    await this.assertPageAdmin(page.id, gamadId);
    await this.repo.deletePost(postId, page.id);
    return { message: 'Publication supprimée' };
  }

  /* ── Catalogue ── */

  async getProducts(slug: string) {
    const page = await this.repo.findBySlug(slug);
    if (!page) throw new NotFoundException('Page introuvable');
    return this.repo.findProducts(page.id);
  }

  async createProduct(slug: string, gamadId: string, dto: CreatePageProductDto) {
    const page = await this.repo.findBySlug(slug);
    if (!page) throw new NotFoundException('Page introuvable');
    await this.assertPageAdmin(page.id, gamadId);
    return this.repo.createProduct(page.id, dto);
  }

  async updateProduct(slug: string, productId: string, gamadId: string, data: any) {
    const page = await this.repo.findBySlug(slug);
    if (!page) throw new NotFoundException('Page introuvable');
    await this.assertPageAdmin(page.id, gamadId);
    await this.repo.updateProduct(productId, page.id, data);
    return this.repo.findProductById(productId);
  }

  async deleteProduct(slug: string, productId: string, gamadId: string) {
    const page = await this.repo.findBySlug(slug);
    if (!page) throw new NotFoundException('Page introuvable');
    await this.assertPageAdmin(page.id, gamadId);
    await this.repo.deleteProduct(productId, page.id);
    return { message: 'Produit supprimé' };
  }

  /* ── Guards ── */

  private async assertPageAdmin(pageId: string, gamadId: string) {
    const page = await this.repo.findById(pageId);
    if (!page) throw new NotFoundException('Page introuvable');
    const membership = await this.prisma.zumaraCellMembership.findFirst({
      where: {
        cellId: page.cellId,
        gamadId,
        role: { in: ['FOUNDER', 'CO_FOUNDER'] },
        status: 'ACTIVE',
      },
    });
    if (!membership) throw new ForbiddenException('Action réservée aux administrateurs de la Page');
  }
}
