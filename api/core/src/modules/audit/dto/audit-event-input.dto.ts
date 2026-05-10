export type AuditEventInputDto = {
  actorId?: string;
  action: string;
  targetType: string;
  targetId?: string;
  organizationUnitId?: string;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
  userAgent?: string;
  correlationId?: string;
  causationId?: string;
};
