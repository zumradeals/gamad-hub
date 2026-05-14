import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeRepository } from './knowledge.repository';
import { AuditModule } from '../audit/audit.module';
import { PermissionGuard } from '../../common/guards/permission.guard';

@Module({
  imports: [AuditModule],
  controllers: [KnowledgeController],
  providers: [KnowledgeService, KnowledgeRepository, PrismaService, PermissionGuard],
  exports: [KnowledgeService],
})
export class KnowledgeModule {}
