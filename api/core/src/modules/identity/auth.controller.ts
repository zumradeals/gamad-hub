import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { ActorId } from '../../common/decorators/actor.decorator';
import { IdentityRepository } from './identity.repository';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly identityRepo: IdentityRepository,
  ) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('refresh')
  @UseGuards(PermissionGuard)
  async refresh(@ActorId() actorId: string) {
    const gamadId = await this.identityRepo.findById(actorId);
    const email = (gamadId as any)?.account?.email ?? '';
    return this.authService.refresh(actorId, email);
  }

  @Get('me')
  @UseGuards(PermissionGuard)
  me(@ActorId() actorId: string) {
    return this.authService.me(actorId);
  }
}
