import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, Req, UseGuards,
} from '@nestjs/common';
import { PortalPagesService } from './portal-pages.service';
import { PortalJwtGuard } from '../portal-auth/portal-jwt.guard';
import { OptionalPortalJwtGuard } from '../portal-auth/optional-portal-jwt.guard';
import { CreatePageDto } from './dto/create-page.dto';
import { CreatePagePostDto } from './dto/create-page-post.dto';
import { CreatePageProductDto } from './dto/create-page-product.dto';

@Controller('portal/pages')
export class PortalPagesController {
  constructor(private readonly service: PortalPagesService) {}

  /* ── Listing ── */

  @Get()
  list(
    @Query('page') page = '1',
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.service.listPages(Number(page) || 1, category, search);
  }

  /* ── Single page ── */

  @UseGuards(OptionalPortalJwtGuard)
  @Get(':slug')
  getOne(@Param('slug') slug: string, @Req() req: any) {
    return this.service.getPage(slug, req.portalUserId);
  }

  /* ── Create / update ── */

  @UseGuards(PortalJwtGuard)
  @Post()
  create(@Req() req: any, @Body() dto: CreatePageDto) {
    return this.service.createPage(req.portalUserId, dto);
  }

  @UseGuards(PortalJwtGuard)
  @Patch(':slug')
  update(@Param('slug') slug: string, @Req() req: any, @Body() data: any) {
    return this.service.updatePage(slug, req.portalUserId, data);
  }

  /* ── Follow ── */

  @UseGuards(PortalJwtGuard)
  @Post(':slug/follow')
  toggleFollow(@Param('slug') slug: string, @Req() req: any) {
    return this.service.toggleFollow(slug, req.portalUserId);
  }

  /* ── Posts ── */

  @Get(':slug/posts')
  getPosts(@Param('slug') slug: string, @Query('page') page = '1') {
    return this.service.getPosts(slug, Number(page) || 1);
  }

  @UseGuards(PortalJwtGuard)
  @Post(':slug/posts')
  createPost(
    @Param('slug') slug: string,
    @Req() req: any,
    @Body() dto: CreatePagePostDto,
  ) {
    return this.service.createPost(slug, req.portalUserId, dto);
  }

  @UseGuards(PortalJwtGuard)
  @Delete(':slug/posts/:postId')
  deletePost(
    @Param('slug') slug: string,
    @Param('postId') postId: string,
    @Req() req: any,
  ) {
    return this.service.deletePost(slug, postId, req.portalUserId);
  }

  /* ── Catalogue ── */

  @Get(':slug/catalogue')
  getProducts(@Param('slug') slug: string) {
    return this.service.getProducts(slug);
  }

  @UseGuards(PortalJwtGuard)
  @Post(':slug/catalogue')
  createProduct(
    @Param('slug') slug: string,
    @Req() req: any,
    @Body() dto: CreatePageProductDto,
  ) {
    return this.service.createProduct(slug, req.portalUserId, dto);
  }

  @UseGuards(PortalJwtGuard)
  @Patch(':slug/catalogue/:productId')
  updateProduct(
    @Param('slug') slug: string,
    @Param('productId') productId: string,
    @Req() req: any,
    @Body() data: any,
  ) {
    return this.service.updateProduct(slug, productId, req.portalUserId, data);
  }

  @UseGuards(PortalJwtGuard)
  @Delete(':slug/catalogue/:productId')
  deleteProduct(
    @Param('slug') slug: string,
    @Param('productId') productId: string,
    @Req() req: any,
  ) {
    return this.service.deleteProduct(slug, productId, req.portalUserId);
  }
}
