import { Module } from '@nestjs/common';
import { PortalAuthController } from './portal-auth.controller';
import { PortalAuthService } from './portal-auth.service';
import { PortalAuthRepository } from './portal-auth.repository';
import { PortalJwtGuard } from './portal-jwt.guard';
import { PrismaModule } from '../../prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [PortalAuthController],
  providers: [PortalAuthService, PortalAuthRepository, PortalJwtGuard],
  exports: [PortalJwtGuard],
})
export class PortalAuthModule {}
