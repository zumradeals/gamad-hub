import { Module, forwardRef } from '@nestjs/common';
import { PortalBlogController } from './portal-blog.controller';
import { PortalBlogService } from './portal-blog.service';
import { PortalBlogRepository } from './portal-blog.repository';
import { ZahabModule } from '../zahab/zahab.module';
import { PortalAuthModule } from '../portal-auth/portal-auth.module';
import { PrismaModule } from '../../prisma.module';
import { ModerationModule } from '../moderation/moderation.module';

@Module({
  imports: [PrismaModule, ZahabModule, PortalAuthModule, forwardRef(() => ModerationModule)],
  controllers: [PortalBlogController],
  providers: [PortalBlogService, PortalBlogRepository],
  exports: [PortalBlogService],
})
export class PortalBlogModule {}
