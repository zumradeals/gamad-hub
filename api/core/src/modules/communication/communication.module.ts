import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CommunicationController } from './communication.controller';
import { CommunicationService } from './communication.service';
import { CommunicationRepository } from './communication.repository';
import { AuditModule } from '../audit/audit.module';
import { PermissionGuard } from '../../common/guards/permission.guard';

@Module({
  imports: [AuditModule],
  controllers: [CommunicationController],
  providers: [CommunicationService, CommunicationRepository, PrismaService, PermissionGuard],
  exports: [CommunicationService],
})
export class CommunicationModule {}
