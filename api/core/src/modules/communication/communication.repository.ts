import { Injectable } from "@nestjs/common";
import { AnnouncementAudienceScope } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class CommunicationRepository {
  constructor(private readonly prisma: PrismaService) {}

  createAnnouncement(data: {
    title: string;
    content: string;
    organizationUnitId?: string;
    audienceScope: AnnouncementAudienceScope;
    publishedBy: string;
  }) {
    return this.prisma.announcement.create({
      data: {
        ...data,
        publishedAt: new Date()
      }
    });
  }

  sendMessage(data: {
    senderId: string;
    recipientId: string;
    organizationUnitId?: string;
    content: string;
  }) {
    return this.prisma.message.create({ data });
  }

  createNotification(data: { gamadId: string; type: string; content: string }) {
    return this.prisma.notification.create({ data });
  }

  markNotificationRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() }
    });
  }

  findNotification(id: string) {
    return this.prisma.notification.findUnique({ where: { id } });
  }
}
