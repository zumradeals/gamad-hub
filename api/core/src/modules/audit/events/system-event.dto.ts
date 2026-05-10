export type SystemEventDto<TPayload = unknown> = {
  eventId: string;
  eventType: string;
  actorId?: string;
  targetType?: string;
  targetId?: string;
  organizationUnitId?: string;
  payload?: TPayload;
  occurredAt: string;
  emittedAt: string;
  correlationId?: string;
  causationId?: string;
};
