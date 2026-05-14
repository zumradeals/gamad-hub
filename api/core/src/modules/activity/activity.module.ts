import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { ActivityRepository } from './activity.repository';
import { AuditModule } from '../audit/audit.module';
import { PermissionGuard } from '../../common/guards/permission.guard';

@Module({
  imports: [AuditModule],
  controllers: [ActivityController],
  providers: [ActivityService, ActivityRepository, PrismaService, PermissionGuard],
  exports: [ActivityService],
})
export class ActivityModule {}
