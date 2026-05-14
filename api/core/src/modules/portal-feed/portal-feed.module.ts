import { Module, forwardRef } from '@nestjs/common';
import { PortalFeedController } from './portal-feed.controller';
import { PortalFeedService } from './portal-feed.service';
import { PortalFeedRepository } from './portal-feed.repository';
import { PortalAuthModule } from '../portal-auth/portal-auth.module';
import { ZahabModule } from '../zahab/zahab.module';
import { PrismaModule } from '../../prisma.module';
import { ModerationModule } from '../moderation/moderation.module';

@Module({
  imports: [PrismaModule, PortalAuthModule, ZahabModule, forwardRef(() => ModerationModule)],
  controllers: [PortalFeedController],
  providers: [PortalFeedService, PortalFeedRepository],
  exports: [PortalFeedService],
})
export class PortalFeedModule {}
