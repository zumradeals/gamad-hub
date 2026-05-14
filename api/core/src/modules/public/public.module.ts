import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { PublicController } from './public.controller';
import { ContentController } from './content.controller';
import { PublicService } from './public.service';
import { PublicRepository } from './public.repository';
import { AuditModule } from '../audit/audit.module';
import { PermissionGuard } from '../../common/guards/permission.guard';

@Module({
  imports: [AuditModule],
  controllers: [PublicController, ContentController],
  providers: [PublicService, PublicRepository, PrismaService, PermissionGuard],
  exports: [PublicService],
})
export class PublicModule {}
