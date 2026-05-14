import { Body, Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { PortalAuthService } from './portal-auth.service';
import { PortalRegisterDto } from './dto/portal-register.dto';
import { PortalLoginDto } from './dto/portal-login.dto';
import { PortalApplyDto } from './dto/portal-apply.dto';
import { PortalJwtGuard } from './portal-jwt.guard';

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
}
