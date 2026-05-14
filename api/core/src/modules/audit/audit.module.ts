import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { AuditRepository } from './audit.repository';

@Module({
  controllers: [AuditController],
  providers: [AuditService, AuditRepository, PrismaService],
  exports: [AuditService],
})
export class AuditModule {}
