import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';
import { IdentityRepository } from './identity.repository';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ProfilesController } from './profiles.controller';
import { AuditModule } from '../audit/audit.module';
import { PermissionGuard } from '../../common/guards/permission.guard';

@Module({
  imports: [AuditModule],
  controllers: [AuthController, IdentityController, ProfilesController],
  providers: [
    IdentityService,
    IdentityRepository,
    AuthService,
    PrismaService,
    PermissionGuard,
  ],
  exports: [IdentityService, IdentityRepository],
})
export class IdentityModule {}
