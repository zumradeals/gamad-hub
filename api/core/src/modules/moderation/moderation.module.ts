import { Module } from '@nestjs/common';
import { ModerationController, FeedReportController, BlogReportController } from './moderation.controller';
import { ModerationService } from './moderation.service';
import { ModerationRepository } from './moderation.repository';
import { ZahabModule } from '../zahab/zahab.module';
import { PortalAuthModule } from '../portal-auth/portal-auth.module';
import { PrismaModule } from '../../prisma.module';

@Module({
  imports: [PrismaModule, ZahabModule, PortalAuthModule],
  controllers: [ModerationController, FeedReportController, BlogReportController],
  providers: [ModerationService, ModerationRepository],
  exports: [ModerationService],
})
export class ModerationModule {}
