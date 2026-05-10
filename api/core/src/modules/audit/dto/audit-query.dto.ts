export type AuditQueryDto = {
  actorId?: string;
  targetType?: string;
  organizationUnitId?: string;
  from?: string;
  to?: string;
  page?: string;
  limit?: string;
};
