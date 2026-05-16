import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, Request,
} from '@nestjs/common';
import { ModerationService } from './moderation.service';
import { PortalJwtGuard } from '../portal-auth/portal-jwt.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { VeteranGuard, GuardianGuard } from './veteran.guard';
import { ReviewContentDto } from './dto/review-content.dto';
import { ReportContentDto } from './dto/report-content.dto';

@Controller('portal/moderation')
export class ModerationController {
  constructor(private readonly service: ModerationService) {}

  // ── File d'attente — VETERAN+ ─────────────────────────────────────────────────

  @Get('queue')
  @UseGuards(PortalJwtGuard, VeteranGuard)
  getQueue() {
    return this.service.getQueue();
  }

  @Post('review/:id')
  @UseGuards(PortalJwtGuard, VeteranGuard)
  review(
    @Param('id') id: string,
    @Body() dto: ReviewContentDto,
    @Query('type') type: 'post' | 'article' = 'post',
    @Request() req: any,
  ) {
    return this.service.review(id, req.portalUserId, dto.approve, dto.note, type);
  }

  // ── Signalements — GUARDIAN ───────────────────────────────────────────────────

  @Get('reports')
  @UseGuards(PortalJwtGuard, GuardianGuard)
  getReports() {
    return this.service.getReports();
  }

  @Put('reports/:id')
  @UseGuards(PortalJwtGuard, GuardianGuard)
  handleReport(
    @Param('id') id: string,
    @Body() body: { validated: boolean; reviewNote?: string },
    @Request() req: any,
  ) {
    return this.service.handleReport(id, req.portalUserId, body.validated, body.reviewNote);
  }

  // ── Stats — GUARDIAN ──────────────────────────────────────────────────────────

  @Get('stats')
  @UseGuards(PortalJwtGuard, GuardianGuard)
  getStats() {
    return this.service.getStats();
  }
}

// ── Gouvernance HCG — règles de filtrage (Core JWT) ──────────────────────────
@Controller('governance/moderation')
@UseGuards(PermissionGuard)
export class ModerationGovernanceController {
  constructor(private readonly service: ModerationService) {}

  @Get('stats')
  getStats() {
    return this.service.getStats();
  }

  @Get('filter-rules')
  getFilterRules() {
    return this.service.getFilterRules();
  }

  @Post('filter-rules')
  addFilterRule(@Body() body: { keyword: string; severity: 'FLAG' | 'BLOCK' }, @Request() req: any) {
    return this.service.addFilterRule(body.keyword, body.severity, req.actorId);
  }

  @Delete('filter-rules/:id')
  deleteFilterRule(@Param('id') id: string) {
    return this.service.deleteFilterRule(id);
  }
}

// ── Signalement depuis le feed ────────────────────────────────────────────────
@Controller('portal/feed')
export class FeedReportController {
  constructor(private readonly service: ModerationService) {}

  @Post(':id/report')
  @UseGuards(PortalJwtGuard)
  reportPost(@Param('id') id: string, @Body() dto: ReportContentDto, @Request() req: any) {
    return this.service.report(req.portalUserId, id, 'POST', dto.reason, dto.note);
  }
}

// ── Signalement depuis le blog ────────────────────────────────────────────────
@Controller('portal/blog')
export class BlogReportController {
  constructor(private readonly service: ModerationService) {}

  @Post(':id/report')
  @UseGuards(PortalJwtGuard)
  reportArticle(@Param('id') id: string, @Body() dto: ReportContentDto, @Request() req: any) {
    return this.service.report(req.portalUserId, id, 'ARTICLE', dto.reason, dto.note);
  }
}
