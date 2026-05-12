import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module";
import { KnowledgeController } from "./knowledge.controller";
import { KnowledgeRepository } from "./knowledge.repository";
import { KnowledgeService } from "./knowledge.service";

@Module({
  imports: [AuditModule],
  controllers: [KnowledgeController],
  providers: [KnowledgeRepository, KnowledgeService],
  exports: [KnowledgeService]
})
export class KnowledgeModule {}
