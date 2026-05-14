import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { ActivityRepository } from './activity.repository';

@Module({
  controllers: [ActivityController],
  providers: [ActivityService, ActivityRepository, PrismaService],
  exports: [ActivityService],
})
export class ActivityModule {}
