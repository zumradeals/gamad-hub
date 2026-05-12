import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module";
import { CommunicationController } from "./communication.controller";
import { CommunicationRepository } from "./communication.repository";
import { CommunicationService } from "./communication.service";

@Module({
  imports: [AuditModule],
  controllers: [CommunicationController],
  providers: [CommunicationRepository, CommunicationService],
  exports: [CommunicationService]
})
export class CommunicationModule {}
