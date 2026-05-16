import { Module } from '@nestjs/common';
import { ModerationController, FeedReportController, BlogReportController, ModerationGovernanceController } from './moderation.controller';
import { ModerationService } from './moderation.service';
import { ModerationRepository } from './moderation.repository';
import { VeteranGuard, GuardianGuard } from './veteran.guard';
import { ZahabModule } from '../zahab/zahab.module';
import { PortalAuthModule } from '../portal-auth/portal-auth.module';
import { PrismaModule } from '../../prisma.module';

@Module({
  imports: [PrismaModule, ZahabModule, PortalAuthModule],
  controllers: [ModerationController, FeedReportController, BlogReportController, ModerationGovernanceController],
  providers: [ModerationService, ModerationRepository, VeteranGuard, GuardianGuard],
  exports: [ModerationService],
})
export class ModerationModule {}
