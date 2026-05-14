import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { FormationController } from './formation.controller';
import { FormationService } from './formation.service';
import { FormationRepository } from './formation.repository';
import { AuditModule } from '../audit/audit.module';
import { PermissionGuard } from '../../common/guards/permission.guard';

@Module({
  imports: [AuditModule],
  controllers: [FormationController],
  providers: [FormationService, FormationRepository, PrismaService, PermissionGuard],
  exports: [FormationService, FormationRepository],
})
export class FormationModule {}
