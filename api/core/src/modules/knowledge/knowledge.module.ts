import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeRepository } from './knowledge.repository';

@Module({
  controllers: [KnowledgeController],
  providers: [KnowledgeService, KnowledgeRepository, PrismaService],
  exports: [KnowledgeService],
})
export class KnowledgeModule {}
