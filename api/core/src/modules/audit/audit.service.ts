import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import { PermissionsService } from "../permissions/permissions.service";
import { AuditEventInputDto } from "./dto/audit-event-input.dto";
import { AuditQueryDto } from "./dto/audit-query.dto";
import { EventBusService } from "./event-bus.service";

@Injectable()
export class AuditService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissionsService: PermissionsService,
    private readonly eventBus: EventBusService
  ) {}

  emitEvent<TPayload>(eventType: string, payload?: TPayload, context?: Partial<AuditEventInputDto>) {
    return this.eventBus.emitEvent({
      eventType,
      actorId: context?.actorId,
      targetType: context?.targetType,
      targetId: context?.targetId,
      organizationUnitId: context?.organizationUnitId,
      correlationId: context?.correlationId,
      causationId: context?.causationId,
      payload: this.sanitize(payload)
    });
  }

  async writeAudit(input: AuditEventInputDto) {
    return this.prisma.auditEvent.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
        organizationUnitId: input.organizationUnitId,
        oldValue: this.toJson(input.oldValue),
        newValue: this.toJson(input.newValue),
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        correlationId: input.correlationId,
        causationId: input.causationId
      }
    });
  }

  async listAuditEvents(actorId: string | undefined, query: AuditQueryDto) {
    await this.permissionsService.assertPermission({ actorId: actorId ?? "", permissionCode: "audit.read" });

    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 20), 1), 100);
    const where = this.toWhere(query);

    const [items, total] = await Promise.all([
      this.prisma.auditEvent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.auditEvent.count({ where })
    ]);

    return {
      items,
      page,
      limit,
      total
    };
  }

  async exportAuditEvents(actorId: string | undefined, query: AuditQueryDto) {
    await this.permissionsService.assertPermission({ actorId: actorId ?? "", permissionCode: "audit.export" });
    const where = this.toWhere(query);
    const items = await this.prisma.auditEvent.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });

    await this.writeAudit({
      actorId,
      action: "AUDIT_EXPORTED",
      targetType: "AUDIT_EVENT",
      newValue: { count: items.length, filters: query }
    });
    this.emitEvent("AUDIT_EXPORTED", { count: items.length }, { actorId, targetType: "AUDIT_EVENT" });

    return {
      exportedAt: new Date().toISOString(),
      count: items.length,
      items
    };
  }

  private toWhere(query: AuditQueryDto): Prisma.AuditEventWhereInput {
    return {
      actorId: query.actorId,
      targetType: query.targetType,
      organizationUnitId: query.organizationUnitId,
      createdAt: {
        gte: query.from ? new Date(query.from) : undefined,
        lte: query.to ? new Date(query.to) : undefined
      }
    };
  }

  private toJson(value: unknown) {
    if (value === undefined) {
      return undefined;
    }
    return this.sanitize(value) as Prisma.InputJsonValue;
  }

  private sanitize(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.sanitize(item));
    }
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [
          key,
          this.isSecretKey(key) ? "[REDACTED]" : this.sanitize(nestedValue)
        ])
      );
    }
    return value;
  }

  private isSecretKey(key: string) {
    const normalized = key.toLowerCase();
    return normalized.includes("password") || normalized.includes("token") || normalized.includes("secret");
  }
}
