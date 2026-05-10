import { Module } from "@nestjs/common";
import { AuditController } from "./audit.controller";
import { AuditService } from "./audit.service";
import { EventBusService } from "./event-bus.service";

@Module({
  controllers: [AuditController],
  providers: [AuditService, EventBusService],
  exports: [AuditService, EventBusService]
})
export class AuditModule {}
