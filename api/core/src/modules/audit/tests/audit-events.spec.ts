type SystemEvent = {
  eventId: string;
  eventType: string;
  actorId?: string;
  targetType?: string;
  targetId?: string;
  organizationUnitId?: string;
  correlationId?: string;
  causationId?: string;
  payload?: unknown;
  occurredAt: string;
  emittedAt: string;
};

function createEvent(eventType: string, context?: Partial<SystemEvent>): SystemEvent {
  return {
    eventId: "test-uuid",
    eventType,
    occurredAt: new Date().toISOString(),
    emittedAt: new Date().toISOString(),
    ...context
  };
}

describe("audit events", () => {
  it("creates an event with required fields", () => {
    const event = createEvent("MEMBER_VALIDATED", {
      actorId: "actor-1",
      targetType: "GAMAD_ID",
      targetId: "target-1"
    });
    expect(event.eventType).toBe("MEMBER_VALIDATED");
    expect(event.actorId).toBe("actor-1");
    expect(event.targetId).toBe("target-1");
    expect(event.eventId).toBeTruthy();
    expect(event.occurredAt).toBeTruthy();
  });

  it("supports correlation and causation IDs", () => {
    const cause = createEvent("ACTIVITY_SUBMITTED", { eventId: "cause-1" });
    const effect = createEvent("WORKFLOW_STARTED", {
      causationId: cause.eventId,
      correlationId: "corr-1"
    });
    expect(effect.causationId).toBe("cause-1");
    expect(effect.correlationId).toBe("corr-1");
  });

  it("preserves event type for all documented identity events", () => {
    const events = [
      "GAMAD_ID_CREATED", "ACCOUNT_CREATED", "MEMBER_VALIDATED",
      "MEMBER_SUSPENDED", "LOGIN_SUCCESS", "LOGIN_FAILED"
    ];
    for (const eventType of events) {
      const event = createEvent(eventType);
      expect(event.eventType).toBe(eventType);
    }
  });
});
