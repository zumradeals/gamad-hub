import { Module } from '@nestjs/common';
import { PortalBlogController } from './portal-blog.controller';
import { PortalBlogService } from './portal-blog.service';
import { PortalBlogRepository } from './portal-blog.repository';
import { ZahabModule } from '../zahab/zahab.module';
import { PortalAuthModule } from '../portal-auth/portal-auth.module';
import { PrismaModule } from '../../prisma.module';

@Module({
  imports: [PrismaModule, ZahabModule, PortalAuthModule],
  controllers: [PortalBlogController],
  providers: [PortalBlogService, PortalBlogRepository],
})
export class PortalBlogModule {}
