import { Controller, Get, Headers, Query } from "@nestjs/common";
import { ok } from "../../common/api-response";
import { AuditQueryDto } from "./dto/audit-query.dto";
import { AuditService } from "./audit.service";

@Controller("audit")
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get("events")
  async listAuditEvents(@Headers("x-gamad-actor-id") actorId: string | undefined, @Query() query: AuditQueryDto) {
    return ok(await this.auditService.listAuditEvents(actorId, query));
  }

  @Get("events/export")
  async exportAuditEvents(@Headers("x-gamad-actor-id") actorId: string | undefined, @Query() query: AuditQueryDto) {
    return ok(await this.auditService.exportAuditEvents(actorId, query), {
      events: ["AUDIT_EXPORTED"]
    });
  }
}
