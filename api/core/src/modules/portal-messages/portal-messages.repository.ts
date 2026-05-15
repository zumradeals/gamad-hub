import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class PortalMessagesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findReceived(gamadId: string) {
    return this.prisma.message.findMany({
      where: { recipientId: gamadId, status: { not: 'ARCHIVED' } },
      include: {
        sender: { include: { profile: { select: { displayName: true } }, gamad: { select: { publicCode: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  findSent(gamadId: string) {
    return this.prisma.message.findMany({
      where: { senderId: gamadId },
      include: {
        recipient: { include: { profile: { select: { displayName: true } }, gamad: { select: { publicCode: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  findById(id: string) {
    return this.prisma.message.findUnique({
      where: { id },
      include: {
        sender: { include: { profile: { select: { displayName: true } } } },
        recipient: { include: { profile: { select: { displayName: true } } } },
      },
    });
  }

  async findRecipientByPublicCode(publicCode: string) {
    return this.prisma.gamadId.findUnique({
      where: { publicCode },
      select: { id: true, publicCode: true, profile: { select: { displayName: true } } },
    });
  }

  send(senderId: string, recipientId: string, content: string) {
    return this.prisma.message.create({
      data: { senderId, recipientId, content },
      include: {
        recipient: { include: { profile: { select: { displayName: true } } } },
      },
    });
  }

  markRead(id: string) {
    return this.prisma.message.update({ where: { id }, data: { status: 'READ' } });
  }

  countUnread(gamadId: string) {
    return this.prisma.message.count({ where: { recipientId: gamadId, status: 'SENT' } });
  }
}
