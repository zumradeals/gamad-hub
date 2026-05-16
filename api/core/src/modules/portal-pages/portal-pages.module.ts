import { Module } from '@nestjs/common';
import { PortalPagesController } from './portal-pages.controller';
import { PortalPagesService } from './portal-pages.service';
import { PortalPagesRepository } from './portal-pages.repository';
import { PrismaModule } from '../../prisma.module';
import { PortalAuthModule } from '../portal-auth/portal-auth.module';

@Module({
  imports: [PrismaModule, PortalAuthModule],
  controllers: [PortalPagesController],
  providers: [PortalPagesService, PortalPagesRepository],
})
export class PortalPagesModule {}
