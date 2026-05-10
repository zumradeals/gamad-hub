import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { AnnouncementAudienceScope } from "@prisma/client";
import { AuditService } from "../audit/audit.service";
import { PermissionsService } from "../permissions/permissions.service";
import { CommunicationRepository } from "./communication.repository";
import { CreateAnnouncementDto } from "./dto/create-announcement.dto";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { SendMessageDto } from "./dto/send-message.dto";

@Injectable()
export class CommunicationService {
  constructor(
    private readonly communicationRepository: CommunicationRepository,
    private readonly permissionsService: PermissionsService,
    private readonly auditService: AuditService
  ) {}

  async createAnnouncement(actorId: string | undefined, dto: CreateAnnouncementDto) {
    await this.permissionsService.assertPermission({ actorId: actorId ?? "", permissionCode: "announcement.create", organizationUnitId: dto.organizationUnitId });
    this.assertText(dto.title, "title");
    this.assertText(dto.content, "content");

    const announcement = await this.communicationRepository.createAnnouncement({
      title: dto.title,
      content: dto.content,
      organizationUnitId: dto.organizationUnitId,
      audienceScope: this.toAudienceScope(dto.audienceScope),
      publishedBy: actorId ?? ""
    });

    await this.auditAndEmit(actorId, "ANNOUNCEMENT_CREATED", "ANNOUNCEMENT", announcement.id, dto.organizationUnitId, announcement);
    this.auditService.emitEvent("ANNOUNCEMENT_PUBLISHED", { announcementId: announcement.id }, { actorId, targetType: "ANNOUNCEMENT", targetId: announcement.id });
    return announcement;
  }

  async sendMessage(actorId: string | undefined, dto: SendMessageDto) {
    await this.permissionsService.assertPermission({ actorId: actorId ?? "", permissionCode: "message.send", organizationUnitId: dto.organizationUnitId });
    this.assertText(dto.content, "content");
    if (!dto.recipientId) {
      throw new BadRequestException("recipientId is required");
    }

    const message = await this.communicationRepository.sendMessage({
      senderId: actorId ?? "",
      recipientId: dto.recipientId,
      organizationUnitId: dto.organizationUnitId,
      content: dto.content
    });

    await this.auditAndEmit(actorId, "MESSAGE_SENT", "MESSAGE", message.id, dto.organizationUnitId, { recipientId: dto.recipientId });
    return message;
  }

  async createNotification(actorId: string | undefined, dto: CreateNotificationDto) {
    await this.permissionsService.assertPermission({ actorId: actorId ?? "", permissionCode: "notification.create" });
    this.assertText(dto.type, "type");
    this.assertText(dto.content, "content");
    const notification = await this.communicationRepository.createNotification(dto);
    await this.auditAndEmit(actorId, "NOTIFICATION_CREATED", "NOTIFICATION", notification.id, undefined, notification);
    return notification;
  }

  async markNotificationRead(actorId: string | undefined, id: string) {
    if (!actorId) {
      throw new ForbiddenException("Authentication required");
    }
    const notification = await this.communicationRepository.findNotification(id);
    if (!notification) {
      throw new NotFoundException("Notification not found");
    }
    if (notification.gamadId !== actorId) {
      throw new ForbiddenException("Cannot read another member notification");
    }
    const updated = await this.communicationRepository.markNotificationRead(id);
    this.auditService.emitEvent("NOTIFICATION_READ", { notificationId: id }, { actorId, targetType: "NOTIFICATION", targetId: id });
    return updated;
  }

  private async auditAndEmit(actorId: string | undefined, action: string, targetType: string, targetId: string, organizationUnitId?: string, newValue?: unknown) {
    await this.auditService.writeAudit({ actorId, action, targetType, targetId, organizationUnitId, newValue });
    this.auditService.emitEvent(action, newValue, { actorId, targetType, targetId, organizationUnitId });
  }

  private assertText(value: string | undefined, field: string) {
    if (!value?.trim()) {
      throw new BadRequestException(`${field} is required`);
    }
  }

  private toAudienceScope(value: string) {
    const normalized = value.toUpperCase();
    if (!["PUBLIC", "INTERNAL", "UNIT", "ROLE"].includes(normalized)) {
      throw new BadRequestException("invalid audience scope");
    }
    return normalized as AnnouncementAudienceScope;
  }
}
