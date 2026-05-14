import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CotisationController } from './cotisation.controller';
import { CotisationService } from './cotisation.service';
import { CotisationRepository } from './cotisation.repository';
import { AuditModule } from '../audit/audit.module';
import { PermissionGuard } from '../../common/guards/permission.guard';

@Module({
  imports: [AuditModule],
  controllers: [CotisationController],
  providers: [CotisationService, CotisationRepository, PrismaService, PermissionGuard],
  exports: [CotisationService],
})
export class CotisationModule {}
