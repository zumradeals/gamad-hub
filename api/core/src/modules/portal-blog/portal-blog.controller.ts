import {
  Body, Controller, Delete, ForbiddenException, Get, Param,
  Post, Put, Query, Req, UseGuards,
} from '@nestjs/common';
import { PortalBlogService } from './portal-blog.service';
import { ModuleConfigService } from '../module-config/module-config.service';
import { PortalJwtGuard } from '../portal-auth/portal-jwt.guard';
import { OptionalPortalJwtGuard } from '../portal-auth/optional-portal-jwt.guard';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ReviewArticleDto } from './dto/review-article.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('portal/blog')
export class PortalBlogController {
  constructor(
    private readonly service: PortalBlogService,
    private readonly config: ModuleConfigService,
  ) {}

  /* ── Public ── */

  @Get()
  getPublished(
    @Query('page') page = '1',
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
  ) {
    return this.service.getPublished(Number(page) || 1, { category, search, sort });
  }

  @Get('trending')
  getTrending() {
    return this.service.getTrending();
  }

  @Get('categories')
  getCategories() {
    return this.service.getCategories();
  }

  @Get('me/articles')
  @UseGuards(PortalJwtGuard)
  getMyArticles(@Req() req: any) {
    return this.service.getMyArticles(req.portalUserId);
  }

  @Get('me/stats')
  @UseGuards(PortalJwtGuard)
  getMyStats(@Req() req: any) {
    return this.service.getMyStats(req.portalUserId);
  }

  /* ── Editorial (EDITOR role requis) ── */

  @Get('redaction/queue')
  @UseGuards(PortalJwtGuard)
  async getQueue(@Req() req: any) {
    const isEditor = await this.config.hasRole('BLOG', req.portalUserId, 'EDITOR');
    if (!isEditor) throw new ForbiddenException('Accès réservé aux éditeurs');
    return this.service.getPendingReview();
  }

  @Post('redaction/:id/review')
  @UseGuards(PortalJwtGuard)
  async review(@Param('id') id: string, @Req() req: any, @Body() dto: ReviewArticleDto) {
    const isEditor = await this.config.hasRole('BLOG', req.portalUserId, 'EDITOR');
    if (!isEditor) throw new ForbiddenException('Accès réservé aux éditeurs');
    return this.service.reviewArticle(id, req.portalUserId, dto);
  }

  /* ── Article by slug ── */

  @UseGuards(OptionalPortalJwtGuard)
  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.service.getBySlug(slug);
  }

  @Post(':slug/read')
  @UseGuards(PortalJwtGuard)
  markRead(@Param('slug') slug: string, @Req() req: any) {
    return this.service.markRead(slug, req.portalUserId);
  }

  @Post(':slug/like')
  @UseGuards(PortalJwtGuard)
  toggleLike(@Param('slug') slug: string, @Req() req: any) {
    return this.service.toggleLike(slug, req.portalUserId);
  }

  @Get(':slug/comments')
  getComments(@Param('slug') slug: string) {
    return this.service.getComments(slug);
  }

  @Post(':slug/comments')
  @UseGuards(PortalJwtGuard)
  addComment(@Param('slug') slug: string, @Req() req: any, @Body() dto: CreateCommentDto) {
    return this.service.addComment(slug, req.portalUserId, dto);
  }

  @Delete(':slug/comments/:commentId')
  @UseGuards(PortalJwtGuard)
  deleteComment(
    @Param('slug') slug: string,
    @Param('commentId') commentId: string,
    @Req() req: any,
  ) {
    return this.service.deleteComment(slug, commentId, req.portalUserId);
  }

  /* ── Author CRUD ── */

  @Post()
  @UseGuards(PortalJwtGuard)
  create(@Body() dto: CreateArticleDto, @Req() req: any) {
    return this.service.create(dto, req.portalUserId);
  }

  @Put(':id')
  @UseGuards(PortalJwtGuard)
  update(@Param('id') id: string, @Body() dto: UpdateArticleDto, @Req() req: any) {
    return this.service.update(id, dto, req.portalUserId);
  }

  @Delete(':id')
  @UseGuards(PortalJwtGuard)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, req.portalUserId);
  }

  @Post(':id/submit')
  @UseGuards(PortalJwtGuard)
  submit(@Param('id') id: string, @Req() req: any) {
    return this.service.submit(id, req.portalUserId);
  }
}
