import {
  Body, Controller, Delete, ForbiddenException, Get, Param,
  Post, Put, Query, Req, UseGuards,
} from '@nestjs/common';
import { PortalVideoTubeService } from './portal-videotube.service';
import { ModuleConfigService } from '../module-config/module-config.service';
import { PortalJwtGuard } from '../portal-auth/portal-jwt.guard';
import { OptionalPortalJwtGuard } from '../portal-auth/optional-portal-jwt.guard';
import { SubmitVideoDto } from './dto/submit-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { ReviewVideoDto } from './dto/review-video.dto';
import { UpsertChannelDto } from './dto/upsert-channel.dto';

@Controller('portal/videos')
export class PortalVideoTubeController {
  constructor(
    private readonly service: PortalVideoTubeService,
    private readonly config: ModuleConfigService,
  ) {}

  /* ── Public listings ── */

  @Get()
  listVideos(
    @Query('page') page = '1',
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
  ) {
    return this.service.listVideos({ page: Number(page) || 1, category, search, sort });
  }

  @Get('trending')
  getTrending() {
    return this.service.getTrendingVideos();
  }

  @Get('tv')
  getGamadTv() {
    return this.service.getGamadTvVideos();
  }

  @Get('categories')
  getCategories() {
    return this.service.getCategories();
  }

  /* ── Studio: stats + video management ── */

  @Get('studio/stats')
  @UseGuards(PortalJwtGuard)
  getStudioStats(@Req() req: any) {
    return this.service.getStudioStats(req.portalUserId);
  }

  @Get('me')
  @UseGuards(PortalJwtGuard)
  getMyVideos(@Req() req: any) {
    return this.service.findMyVideos(req.portalUserId);
  }

  @Post()
  @UseGuards(PortalJwtGuard)
  submitVideo(@Req() req: any, @Body() dto: SubmitVideoDto) {
    return this.service.submitVideo(req.portalUserId, dto);
  }

  @Put(':id')
  @UseGuards(PortalJwtGuard)
  updateVideo(@Param('id') id: string, @Req() req: any, @Body() dto: UpdateVideoDto) {
    return this.service.updateVideo(req.portalUserId, id, dto);
  }

  @Delete(':id')
  @UseGuards(PortalJwtGuard)
  deleteVideo(@Param('id') id: string, @Req() req: any) {
    return this.service.deleteVideo(req.portalUserId, id);
  }

  /* ── Editorial queue (EDITOR role) ── */

  @Get('redaction/queue')
  @UseGuards(PortalJwtGuard)
  async getQueue(@Req() req: any) {
    const isEditor = await this.config.hasRole('VIDEOTUBE', req.portalUserId, 'EDITOR');
    if (!isEditor) throw new ForbiddenException('Rôle éditeur requis');
    return this.service.getPendingReview();
  }

  @Post('redaction/:id/review')
  @UseGuards(PortalJwtGuard)
  async reviewVideo(@Req() req: any, @Param('id') id: string, @Body() dto: ReviewVideoDto) {
    return this.service.reviewVideo(id, req.portalUserId, dto.decision, dto.note);
  }

  /* ── Single video ── */

  @Get(':slug')
  @UseGuards(OptionalPortalJwtGuard)
  getVideo(@Param('slug') slug: string, @Req() req: any) {
    return this.service.getVideoBySlug(slug, req.portalUserId);
  }

  /* ── Watch reward ── */

  @Post(':id/watch')
  @UseGuards(PortalJwtGuard)
  markWatched(@Param('id') id: string, @Req() req: any) {
    return this.service.markWatched(id, req.portalUserId);
  }

  /* ── Like ── */

  @Post(':id/like')
  @UseGuards(PortalJwtGuard)
  toggleLike(@Param('id') id: string, @Req() req: any) {
    return this.service.toggleLike(id, req.portalUserId);
  }

  /* ── Comments ── */

  @Post(':id/comments')
  @UseGuards(PortalJwtGuard)
  addComment(@Param('id') id: string, @Req() req: any, @Body() dto: AddCommentDto) {
    return this.service.addComment(id, req.portalUserId, dto.content);
  }

  @Delete(':id/comments/:commentId')
  @UseGuards(PortalJwtGuard)
  deleteComment(@Param('commentId') commentId: string, @Req() req: any) {
    return this.service.deleteComment(commentId, req.portalUserId);
  }
}

@Controller('portal/channels')
export class PortalChannelController {
  constructor(private readonly service: PortalVideoTubeService) {}

  @Get('me')
  @UseGuards(PortalJwtGuard)
  getMyChannel(@Req() req: any) {
    return this.service.getMyChannel(req.portalUserId);
  }

  @Post()
  @UseGuards(PortalJwtGuard)
  upsertChannel(@Req() req: any, @Body() dto: UpsertChannelDto) {
    return this.service.upsertChannel(req.portalUserId, dto);
  }

  @Put()
  @UseGuards(PortalJwtGuard)
  updateChannel(@Req() req: any, @Body() dto: UpsertChannelDto) {
    return this.service.upsertChannel(req.portalUserId, dto);
  }

  @Get(':slug')
  getChannel(@Param('slug') slug: string) {
    return this.service.getChannelBySlug(slug);
  }
}
