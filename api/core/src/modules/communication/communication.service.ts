import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PostStatus, MessageStatus, ThreadVisibility, AnnouncementAudience } from '@prisma/client';
import { CommunicationRepository } from './communication.repository';
import { AuditService } from '../audit/audit.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { ReactPostDto } from './dto/react-post.dto';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class CommunicationService {
  constructor(
    private readonly repo: CommunicationRepository,
    private readonly audit: AuditService,
  ) {}

  // ── Threads ───────────────────────────────────────────────────────────────

  findAllThreads(opts?: { unitId?: string; visibility?: string; skip?: number; take?: number }) {
    return this.repo.findAllThreads(opts);
  }

  async findThreadById(id: string) {
    const thread = await this.repo.findThreadById(id);
    if (!thread) throw new NotFoundException('Thread not found');
    return thread;
  }

  async createThread(actorId: string, dto: CreateThreadDto) {
    const thread = await this.repo.createThread({
      title: dto.title,
      organizationUnitId: dto.organizationUnitId,
      visibility: (dto.visibility as ThreadVisibility) ?? ThreadVisibility.PUBLIC,
    });
    await this.audit.createEvent({
      actorId,
      action: 'THREAD_CREATED',
      targetType: 'Thread',
      targetId: thread.id,
      metadata: { title: thread.title, visibility: thread.visibility },
    });
    return thread;
  }

  async updateThread(actorId: string, id: string, dto: UpdateThreadDto) {
    const thread = await this.repo.findThreadById(id);
    if (!thread) throw new NotFoundException('Thread not found');
    return this.repo.updateThread(id, dto);
  }

  // ── Posts ─────────────────────────────────────────────────────────────────

  async createPost(actorId: string, threadId: string, dto: CreatePostDto) {
    const thread = await this.repo.findThreadById(threadId);
    if (!thread) throw new NotFoundException('Thread not found');
    if (thread.isLocked) throw new ForbiddenException('Thread is locked');

    const post = await this.repo.createPost({ threadId, authorId: actorId, content: dto.content });
    await this.audit.createEvent({
      actorId,
      action: 'POST_CREATED',
      targetType: 'Post',
      targetId: post.id,
      metadata: { threadId },
    });
    return post;
  }

  async updatePost(actorId: string, id: string, dto: Partial<{ content: string; status: PostStatus }>) {
    const post = await this.repo.findPostById(id);
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== actorId) throw new ForbiddenException('Cannot edit another member\'s post');

    const updated = await this.repo.updatePost(id, dto);
    if (dto.status && dto.status !== post.status) {
      await this.audit.createEvent({
        actorId,
        action: 'POST_MODERATED',
        targetType: 'Post',
        targetId: id,
        metadata: { newStatus: dto.status },
      });
    }
    return updated;
  }

  async reactToPost(actorId: string, postId: string, dto: ReactPostDto) {
    const post = await this.repo.findPostById(postId);
    if (!post) throw new NotFoundException('Post not found');

    const existing = await this.repo.findReaction(postId, actorId, dto.emoji);
    if (existing) {
      await this.repo.deleteReaction(postId, actorId, dto.emoji);
      return { toggled: false };
    }
    await this.repo.createReaction(postId, actorId, dto.emoji);
    return { toggled: true };
  }

  // ── Announcements ─────────────────────────────────────────────────────────

  findAllAnnouncements(opts?: { unitId?: string; audienceScope?: string; skip?: number; take?: number }) {
    return this.repo.findAllAnnouncements(opts);
  }

  async findAnnouncementById(id: string) {
    const item = await this.repo.findAnnouncementById(id);
    if (!item) throw new NotFoundException('Announcement not found');
    return item;
  }

  async createAnnouncement(actorId: string, dto: CreateAnnouncementDto) {
    const announcement = await this.repo.createAnnouncement({
      title: dto.title,
      content: dto.content,
      publishedBy: actorId,
      organizationUnitId: dto.organizationUnitId,
      audienceScope: (dto.audienceScope as AnnouncementAudience) ?? AnnouncementAudience.INTERNAL,
      publishedAt: new Date(),
    });
    await this.audit.createEvent({
      actorId,
      action: 'ANNOUNCEMENT_PUBLISHED',
      targetType: 'Announcement',
      targetId: announcement.id,
      metadata: { title: announcement.title, audienceScope: announcement.audienceScope },
    });
    return announcement;
  }

  async updateAnnouncement(actorId: string, id: string, dto: Partial<{ title: string; content: string }>) {
    const item = await this.repo.findAnnouncementById(id);
    if (!item) throw new NotFoundException('Announcement not found');
    return this.repo.updateAnnouncement(id, dto);
  }

  // ── Messages ──────────────────────────────────────────────────────────────

  findReceivedMessages(actorId: string) {
    return this.repo.findReceivedMessages(actorId);
  }

  findSentMessages(actorId: string) {
    return this.repo.findSentMessages(actorId);
  }

  async findMessageById(actorId: string, id: string) {
    const msg = await this.repo.findMessageById(id);
    if (!msg) throw new NotFoundException('Message not found');
    if (msg.senderId !== actorId && msg.recipientId !== actorId) {
      throw new ForbiddenException('Access denied');
    }
    return msg;
  }

  async sendMessage(actorId: string, dto: SendMessageDto) {
    const message = await this.repo.createMessage({
      senderId: actorId,
      recipientId: dto.recipientId,
      content: dto.content,
      organizationUnitId: dto.organizationUnitId,
    });
    await this.audit.createEvent({
      actorId,
      action: 'MESSAGE_SENT',
      targetType: 'Message',
      targetId: message.id,
      metadata: { recipientId: dto.recipientId },
    });
    return message;
  }

  async archiveMessage(actorId: string, id: string) {
    const msg = await this.repo.findMessageById(id);
    if (!msg) throw new NotFoundException('Message not found');
    if (msg.recipientId !== actorId) throw new ForbiddenException('Access denied');
    return this.repo.updateMessageStatus(id, MessageStatus.ARCHIVED);
  }

  async markMessageRead(actorId: string, id: string) {
    const msg = await this.repo.findMessageById(id);
    if (!msg) throw new NotFoundException('Message not found');
    if (msg.recipientId !== actorId) throw new ForbiddenException('Access denied');
    return this.repo.updateMessageStatus(id, MessageStatus.READ);
  }

  // ── Notifications ─────────────────────────────────────────────────────────

  findNotifications(actorId: string, onlyUnread = false) {
    return this.repo.findNotifications(actorId, onlyUnread);
  }

  async markNotificationRead(actorId: string, id: string) {
    const notif = await this.repo.findNotificationById(id);
    if (!notif) throw new NotFoundException('Notification not found');
    if (notif.gamadId !== actorId) throw new ForbiddenException('Access denied');
    return this.repo.markNotificationRead(id);
  }

  markAllNotificationsRead(actorId: string) {
    return this.repo.markAllNotificationsRead(actorId);
  }
}
