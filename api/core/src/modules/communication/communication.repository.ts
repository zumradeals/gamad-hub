import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
  ThreadVisibility,
  PostStatus,
  MessageStatus,
  AnnouncementAudience,
} from '@prisma/client';

const AUTHOR_INCLUDE = {
  author: { include: { profile: { select: { displayName: true, avatarUrl: true } } } },
};

@Injectable()
export class CommunicationRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── Threads ───────────────────────────────────────────────────────────────

  findAllThreads(opts?: { unitId?: string; visibility?: string; skip?: number; take?: number }) {
    const where: any = {};
    if (opts?.unitId) where.organizationUnitId = opts.unitId;
    if (opts?.visibility) where.visibility = opts.visibility as ThreadVisibility;
    return this.prisma.thread.findMany({
      where,
      include: {
        organizationUnit: { select: { id: true, name: true } },
        _count: { select: { posts: true } },
      },
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
      skip: opts?.skip ?? 0,
      take: opts?.take ?? 30,
    });
  }

  findThreadById(id: string) {
    return this.prisma.thread.findUnique({
      where: { id },
      include: {
        organizationUnit: { select: { id: true, name: true } },
        posts: {
          where: { status: PostStatus.PUBLISHED },
          include: {
            ...AUTHOR_INCLUDE,
            reactions: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { posts: true } },
      },
    });
  }

  createThread(data: {
    title: string;
    organizationUnitId?: string;
    visibility: ThreadVisibility;
  }) {
    return this.prisma.thread.create({ data, include: { organizationUnit: true } });
  }

  updateThread(id: string, data: Partial<{ title: string; isPinned: boolean; isLocked: boolean }>) {
    return this.prisma.thread.update({ where: { id }, data });
  }

  // ── Posts ─────────────────────────────────────────────────────────────────

  findPostById(id: string) {
    return this.prisma.post.findUnique({
      where: { id },
      include: { ...AUTHOR_INCLUDE, reactions: true },
    });
  }

  createPost(data: { threadId: string; authorId: string; content: string }) {
    return this.prisma.post.create({
      data: { ...data, status: PostStatus.PUBLISHED },
      include: { ...AUTHOR_INCLUDE, reactions: true },
    });
  }

  updatePost(id: string, data: Partial<{ content: string; status: PostStatus }>) {
    return this.prisma.post.update({
      where: { id },
      data,
      include: { ...AUTHOR_INCLUDE, reactions: true },
    });
  }

  findReaction(postId: string, gamadId: string, emoji: string) {
    return this.prisma.postReaction.findUnique({
      where: { postId_gamadId_emoji: { postId, gamadId, emoji } },
    });
  }

  createReaction(postId: string, gamadId: string, emoji: string) {
    return this.prisma.postReaction.create({ data: { postId, gamadId, emoji } });
  }

  deleteReaction(postId: string, gamadId: string, emoji: string) {
    return this.prisma.postReaction.delete({
      where: { postId_gamadId_emoji: { postId, gamadId, emoji } },
    });
  }

  // ── Announcements ─────────────────────────────────────────────────────────

  findAllAnnouncements(opts?: { unitId?: string; audienceScope?: string; skip?: number; take?: number }) {
    const where: any = {};
    if (opts?.unitId) where.organizationUnitId = opts.unitId;
    if (opts?.audienceScope) where.audienceScope = opts.audienceScope as AnnouncementAudience;
    return this.prisma.announcement.findMany({
      where,
      include: {
        publisher: { include: { profile: { select: { displayName: true } } } },
        organizationUnit: { select: { id: true, name: true } },
      },
      orderBy: { publishedAt: 'desc' },
      skip: opts?.skip ?? 0,
      take: opts?.take ?? 20,
    });
  }

  findAnnouncementById(id: string) {
    return this.prisma.announcement.findUnique({
      where: { id },
      include: {
        publisher: { include: { profile: true } },
        organizationUnit: true,
      },
    });
  }

  createAnnouncement(data: {
    title: string;
    content: string;
    publishedBy: string;
    organizationUnitId?: string;
    audienceScope: AnnouncementAudience;
    publishedAt: Date;
  }) {
    return this.prisma.announcement.create({
      data,
      include: {
        publisher: { include: { profile: { select: { displayName: true } } } },
      },
    });
  }

  updateAnnouncement(id: string, data: Partial<{ title: string; content: string }>) {
    return this.prisma.announcement.update({ where: { id }, data });
  }

  // ── Messages ──────────────────────────────────────────────────────────────

  findReceivedMessages(recipientId: string) {
    return this.prisma.message.findMany({
      where: { recipientId, status: { not: MessageStatus.ARCHIVED } },
      include: {
        sender: { include: { profile: { select: { displayName: true, avatarUrl: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findSentMessages(senderId: string) {
    return this.prisma.message.findMany({
      where: { senderId },
      include: {
        recipient: { include: { profile: { select: { displayName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findMessageById(id: string) {
    return this.prisma.message.findUnique({
      where: { id },
      include: {
        sender: { include: { profile: true } },
        recipient: { include: { profile: true } },
      },
    });
  }

  createMessage(data: {
    senderId: string;
    recipientId: string;
    content: string;
    organizationUnitId?: string;
  }) {
    return this.prisma.message.create({
      data: { ...data, status: MessageStatus.SENT },
      include: {
        recipient: { include: { profile: { select: { displayName: true } } } },
      },
    });
  }

  updateMessageStatus(id: string, status: MessageStatus) {
    return this.prisma.message.update({ where: { id }, data: { status } });
  }

  // ── Notifications ─────────────────────────────────────────────────────────

  findNotifications(gamadId: string, onlyUnread = false) {
    return this.prisma.notification.findMany({
      where: { gamadId, ...(onlyUnread ? { readAt: null } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  findNotificationById(id: string) {
    return this.prisma.notification.findUnique({ where: { id } });
  }

  markNotificationRead(id: string) {
    return this.prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
  }

  markAllNotificationsRead(gamadId: string) {
    return this.prisma.notification.updateMany({
      where: { gamadId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  createNotification(data: { gamadId: string; type: string; content: string }) {
    return this.prisma.notification.create({ data });
  }
}
