import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PublicService } from './public.service';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Actor } from '../../common/decorators/actor.decorator';
import { CreateArticleDto } from './dto/create-article.dto';
import { CreateVideoDto } from './dto/create-video.dto';

@UseGuards(PermissionGuard)
@Controller('content')
export class ContentController {
  constructor(private readonly service: PublicService) {}

  // ── Articles ──────────────────────────────────────────────────────────────

  @Post('articles')
  createArticle(@Actor() actorId: string, @Body() dto: CreateArticleDto) {
    return this.service.createArticle(actorId, dto);
  }

  @Post('articles/:id/publish')
  @HttpCode(HttpStatus.OK)
  publishArticle(@Actor() actorId: string, @Param('id') id: string) {
    return this.service.publishArticle(actorId, id);
  }

  @Post('articles/:id/archive')
  @HttpCode(HttpStatus.OK)
  archiveArticle(@Actor() actorId: string, @Param('id') id: string) {
    return this.service.archiveArticle(actorId, id);
  }

  // ── Videos ────────────────────────────────────────────────────────────────

  @Post('videos')
  createVideo(@Actor() actorId: string, @Body() dto: CreateVideoDto) {
    return this.service.createVideo(actorId, dto);
  }

  @Post('videos/:id/publish')
  @HttpCode(HttpStatus.OK)
  publishVideo(@Actor() actorId: string, @Param('id') id: string) {
    return this.service.publishVideo(actorId, id);
  }

  @Post('videos/:id/archive')
  @HttpCode(HttpStatus.OK)
  archiveVideo(@Actor() actorId: string, @Param('id') id: string) {
    return this.service.archiveVideo(actorId, id);
  }
}
