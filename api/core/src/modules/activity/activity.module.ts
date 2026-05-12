import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module";
import { ActivityController } from "./activity.controller";
import { ActivityRepository } from "./activity.repository";
import { ActivityService } from "./activity.service";

@Module({
  imports: [AuditModule],
  controllers: [ActivityController],
  providers: [ActivityRepository, ActivityService],
  exports: [ActivityService]
})
export class ActivityModule {}
