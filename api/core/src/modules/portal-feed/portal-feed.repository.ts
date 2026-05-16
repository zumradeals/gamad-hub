import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { FeedPostStatus, ModerationStatus } from '@prisma/client';

const POST_INCLUDE = {
  gamad: {
    select: {
      publicCode: true,
      profile: { select: { displayName: true, avatarUrl: true } },
    },
  },
  reactions: { select: { emoji: true, gamadId: true } },
  _count: { select: { comments: true } },
};

const COMMENT_INCLUDE = {
  gamad: {
    select: {
      publicCode: true,
      profile: { select: { displayName: true, avatarUrl: true } },
    },
  },
};

@Injectable()
export class PortalFeedRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(opts: {
    skip?: number;
    take?: number;
    hashtag?: string;
    sort?: 'recent' | 'popular';
  }) {
    const where: any = { status: FeedPostStatus.PUBLISHED };
    if (opts.hashtag) {
      where.content = { contains: `#${opts.hashtag}`, mode: 'insensitive' };
    }
    const orderBy: any =
      opts.sort === 'popular'
        ? [{ reactions: { _count: 'desc' } }, { createdAt: 'desc' }]
        : { createdAt: 'desc' };

    return this.prisma.portalFeedPost.findMany({
      where,
      include: POST_INCLUDE,
      orderBy,
      skip: opts.skip ?? 0,
      take: opts.take ?? 20,
    });
  }

  count(hashtag?: string) {
    const where: any = { status: FeedPostStatus.PUBLISHED };
    if (hashtag) {
      where.content = { contains: `#${hashtag}`, mode: 'insensitive' };
    }
    return this.prisma.portalFeedPost.count({ where });
  }

  findById(id: string) {
    return this.prisma.portalFeedPost.findUnique({ where: { id }, include: POST_INCLUDE });
  }

  createWithStatus(
    gamadId: string,
    data: { content: string; imageUrl?: string },
    moderationStatus: ModerationStatus,
  ) {
    return this.prisma.portalFeedPost.create({
      data: {
        gamadId,
        content: data.content,
        moderationStatus,
        ...(data.imageUrl ? { mediaUrls: [data.imageUrl] } : {}),
      },
      include: POST_INCLUDE,
    });
  }

  create(gamadId: string, data: { content: string; imageUrl?: string }) {
    return this.createWithStatus(gamadId, data, ModerationStatus.APPROVED);
  }

  async toggleReaction(postId: string, gamadId: string, emoji: string) {
    const existing = await this.prisma.portalFeedReaction.findUnique({
      where: { postId_gamadId_emoji: { postId, gamadId, emoji } },
    });
    if (existing) {
      await this.prisma.portalFeedReaction.delete({
        where: { postId_gamadId_emoji: { postId, gamadId, emoji } },
      });
      return { action: 'removed' };
    }
    await this.prisma.portalFeedReaction.create({ data: { postId, gamadId, emoji } });
    return { action: 'added' };
  }

  markZahabRewarded(id: string) {
    return this.prisma.portalFeedPost.update({ where: { id }, data: { zahabRewarded: true } });
  }

  async delete(id: string, gamadId: string) {
    return this.prisma.portalFeedPost.updateMany({
      where: { id, gamadId },
      data: { status: FeedPostStatus.DELETED },
    });
  }

  /* ── Comments ── */

  findComments(postId: string) {
    return this.prisma.portalFeedComment.findMany({
      where: { postId },
      include: COMMENT_INCLUDE,
      orderBy: { createdAt: 'asc' },
    });
  }

  createComment(gamadId: string, postId: string, content: string) {
    return this.prisma.portalFeedComment.create({
      data: { gamadId, postId, content },
      include: COMMENT_INCLUDE,
    });
  }

  async deleteComment(commentId: string, gamadId: string) {
    const comment = await this.prisma.portalFeedComment.findUnique({ where: { id: commentId } });
    if (!comment || comment.gamadId !== gamadId) return null;
    return this.prisma.portalFeedComment.delete({ where: { id: commentId } });
  }
}
