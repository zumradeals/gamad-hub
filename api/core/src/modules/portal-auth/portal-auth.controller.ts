import { Body, Controller, Get, Param, Post, Query, UseGuards, Req } from '@nestjs/common';
import { PortalAuthService } from './portal-auth.service';
import { PortalRegisterDto } from './dto/portal-register.dto';
import { PortalLoginDto } from './dto/portal-login.dto';
import { PortalApplyDto } from './dto/portal-apply.dto';
import { ReviewApplicationDto } from './dto/review-application.dto';
import { PortalJwtGuard } from './portal-jwt.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { ActorId } from '../../common/decorators/actor.decorator';

@Controller('portal/auth')
export class PortalAuthController {
  constructor(private readonly service: PortalAuthService) {}

  @Post('register')
  register(@Body() dto: PortalRegisterDto) {
    return this.service.register(dto);
  }

  @Post('login')
  login(@Body() dto: PortalLoginDto) {
    return this.service.login(dto);
  }

  @Get('me')
  @UseGuards(PortalJwtGuard)
  me(@Req() req: any) {
    return this.service.me(req.portalUserId);
  }

  @Post('apply')
  @UseGuards(PortalJwtGuard)
  apply(@Req() req: any, @Body() dto: PortalApplyDto) {
    return this.service.apply(req.portalUserId, dto);
  }

  // ── HCG governance ────────────────────────────────────────────────────────

  @Get('applications')
  @UseGuards(PermissionGuard)
  listApplications(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: string,
  ) {
    return this.service.listApplications({
      skip: skip ? parseInt(skip, 10) : 0,
      take: take ? parseInt(take, 10) : 50,
      status,
    });
  }

  @Post('applications/:id/review')
  @UseGuards(PermissionGuard)
  markUnderReview(@Param('id') id: string, @ActorId() actorId: string) {
    return this.service.markUnderReview(id, actorId);
  }

  @Post('applications/:id/approve')
  @UseGuards(PermissionGuard)
  approve(
    @Param('id') id: string,
    @Body() dto: ReviewApplicationDto,
    @ActorId() actorId: string,
  ) {
    return this.service.approveApplication(id, actorId, dto);
  }

  @Post('applications/:id/reject')
  @UseGuards(PermissionGuard)
  reject(
    @Param('id') id: string,
    @Body() dto: ReviewApplicationDto,
    @ActorId() actorId: string,
  ) {
    return this.service.rejectApplication(id, actorId, dto);
  }
}
