import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { OrganizationRepository } from './organization.repository';
import { AuditModule } from '../audit/audit.module';
import { PermissionGuard } from '../../common/guards/permission.guard';

@Module({
  imports: [AuditModule],
  controllers: [OrganizationController],
  providers: [OrganizationService, OrganizationRepository, PrismaService, PermissionGuard],
  exports: [OrganizationService, OrganizationRepository],
})
export class OrganizationModule {}
