import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { EventEmitter } from "node:events";
import { SystemEventDto } from "./events/system-event.dto";

@Injectable()
export class EventBusService {
  private readonly emitter = new EventEmitter();

  emitEvent<TPayload>(input: Omit<SystemEventDto<TPayload>, "eventId" | "occurredAt" | "emittedAt">) {
    const now = new Date().toISOString();
    const event: SystemEventDto<TPayload> = {
      eventId: randomUUID(),
      occurredAt: now,
      emittedAt: now,
      ...input
    };

    this.emitter.emit(event.eventType, event);
    return event;
  }

  on<TPayload>(eventType: string, listener: (event: SystemEventDto<TPayload>) => void) {
    this.emitter.on(eventType, listener);
  }
}
