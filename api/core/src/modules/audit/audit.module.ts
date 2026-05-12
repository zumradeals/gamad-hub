import { Module } from "@nestjs/common";
import { PrismaModule } from "../../common/prisma/prisma.module";
import { AuditController } from "./audit.controller";
import { AuditService } from "./audit.service";
import { EventBusService } from "./event-bus.service";

@Module({
  imports: [PrismaModule],
  controllers: [AuditController],
  providers: [AuditService, EventBusService],
  exports: [AuditService, EventBusService]
})
export class AuditModule {}
