import { Body, Controller, Headers, Param, Post } from "@nestjs/common";
import { ok } from "../../common/api-response";
import { CommunicationService } from "./communication.service";
import { CreateAnnouncementDto } from "./dto/create-announcement.dto";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { SendMessageDto } from "./dto/send-message.dto";

@Controller("communications")
export class CommunicationController {
  constructor(private readonly communicationService: CommunicationService) {}

  @Post("announcements")
  async createAnnouncement(@Headers("x-gamad-actor-id") actorId: string | undefined, @Body() dto: CreateAnnouncementDto) {
    return ok(await this.communicationService.createAnnouncement(actorId, dto), {
      events: ["ANNOUNCEMENT_CREATED", "ANNOUNCEMENT_PUBLISHED"]
    });
  }

  @Post("messages")
  async sendMessage(@Headers("x-gamad-actor-id") actorId: string | undefined, @Body() dto: SendMessageDto) {
    return ok(await this.communicationService.sendMessage(actorId, dto), {
      events: ["MESSAGE_SENT"]
    });
  }

  @Post("notifications")
  async createNotification(@Headers("x-gamad-actor-id") actorId: string | undefined, @Body() dto: CreateNotificationDto) {
    return ok(await this.communicationService.createNotification(actorId, dto), {
      events: ["NOTIFICATION_CREATED"]
    });
  }

  @Post("notifications/:id/read")
  async markNotificationRead(@Headers("x-gamad-actor-id") actorId: string | undefined, @Param("id") id: string) {
    return ok(await this.communicationService.markNotificationRead(actorId, id), {
      events: ["NOTIFICATION_READ"]
    });
  }
}
