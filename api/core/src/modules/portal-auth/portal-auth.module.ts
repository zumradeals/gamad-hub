import { Module, forwardRef } from '@nestjs/common';
import { PortalAuthController } from './portal-auth.controller';
import { PortalAuthService } from './portal-auth.service';
import { PortalAuthRepository } from './portal-auth.repository';
import { PortalJwtGuard } from './portal-jwt.guard';
import { PrismaModule } from '../../prisma.module';
import { ZahabModule } from '../zahab/zahab.module';

@Module({
  imports: [PrismaModule, forwardRef(() => ZahabModule)],
  controllers: [PortalAuthController],
  providers: [PortalAuthService, PortalAuthRepository, PortalJwtGuard],
  exports: [PortalJwtGuard],
})
export class PortalAuthModule {}
