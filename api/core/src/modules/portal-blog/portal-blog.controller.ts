import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, Request,
} from '@nestjs/common';
import { PortalBlogService } from './portal-blog.service';
import { PortalJwtGuard } from '../portal-auth/portal-jwt.guard';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Controller('portal/blog')
export class PortalBlogController {
  constructor(private readonly service: PortalBlogService) {}

  // ── Public ──────────────────────────────────────────────────────────────────

  @Get()
  getPublished(
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return this.service.getPublished(take ? +take : 20, skip ? +skip : 0);
  }

  @Get('me/articles')
  @UseGuards(PortalJwtGuard)
  getMyArticles(@Request() req: any) {
    return this.service.getMyArticles(req.portalUserId);
  }

  @Get('me/stats')
  @UseGuards(PortalJwtGuard)
  getMyStats(@Request() req: any) {
    return this.service.getMyStats(req.portalUserId);
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.service.getBySlug(slug);
  }

  // ── Auteur ──────────────────────────────────────────────────────────────────

  @Post()
  @UseGuards(PortalJwtGuard)
  create(@Body() dto: CreateArticleDto, @Request() req: any) {
    return this.service.create(dto, req.portalUserId);
  }

  @Put(':id')
  @UseGuards(PortalJwtGuard)
  update(@Param('id') id: string, @Body() dto: UpdateArticleDto, @Request() req: any) {
    return this.service.update(id, dto, req.portalUserId);
  }

  @Delete(':id')
  @UseGuards(PortalJwtGuard)
  remove(@Param('id') id: string, @Request() req: any) {
    return this.service.remove(id, req.portalUserId);
  }

  @Post(':id/publish')
  @UseGuards(PortalJwtGuard)
  publish(@Param('id') id: string, @Request() req: any) {
    return this.service.publish(id, req.portalUserId);
  }
}
