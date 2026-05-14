import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { PublicService } from './public.service';
import { SearchQueryDto } from './dto/search-query.dto';

// No PermissionGuard — all endpoints are unauthenticated
@Controller('public')
export class PublicController {
  constructor(private readonly service: PublicService) {}

  // ── G-SEARCH ──────────────────────────────────────────────────────────────

  @Get('search')
  search(@Query() query: SearchQueryDto) {
    return this.service.search(query);
  }

  // ── Articles ──────────────────────────────────────────────────────────────

  @Get('articles/categories')
  findArticleCategories() {
    return this.service.findArticleCategories();
  }

  @Get('articles')
  findPublishedArticles(
    @Query('category') categorySlug?: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(20), ParseIntPipe) take?: number,
  ) {
    return this.service.findPublishedArticles({ categorySlug, skip, take });
  }

  @Get('articles/:slug')
  findArticleBySlug(@Param('slug') slug: string) {
    return this.service.findArticleBySlug(slug);
  }

  // ── Videos ────────────────────────────────────────────────────────────────

  @Get('videos/categories')
  findVideoCategories() {
    return this.service.findVideoCategories();
  }

  @Get('videos')
  findPublishedVideos(
    @Query('category') categorySlug?: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(20), ParseIntPipe) take?: number,
  ) {
    return this.service.findPublishedVideos({ categorySlug, skip, take });
  }

  @Get('videos/:slug')
  findVideoBySlug(@Param('slug') slug: string) {
    return this.service.findVideoBySlug(slug);
  }

  // ── Formations ────────────────────────────────────────────────────────────

  @Get('formations')
  findPublicFormations(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(20), ParseIntPipe) take?: number,
  ) {
    return this.service.findPublicFormations({ skip, take });
  }

  @Get('formations/:slug')
  findPublicFormationBySlug(@Param('slug') slug: string) {
    return this.service.findPublicFormationBySlug(slug);
  }

  // ── Resources ─────────────────────────────────────────────────────────────

  @Get('resources')
  findPublicDocuments(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(20), ParseIntPipe) take?: number,
  ) {
    return this.service.findPublicDocuments({ skip, take });
  }
}
