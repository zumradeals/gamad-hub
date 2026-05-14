import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { FeedPostStatus } from '@prisma/client';

const POST_INCLUDE = {
  gamad: { include: { profile: { select: { displayName: true, avatarUrl: true } } } },
  reactions: { select: { emoji: true, gamadId: true } },
};

@Injectable()
export class PortalFeedRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(opts: { skip?: number; take?: number }) {
    return this.prisma.portalFeedPost.findMany({
      where: { status: FeedPostStatus.PUBLISHED },
      include: POST_INCLUDE,
      orderBy: { createdAt: 'desc' },
      skip: opts.skip ?? 0,
      take: opts.take ?? 20,
    });
  }

  count() {
    return this.prisma.portalFeedPost.count({ where: { status: FeedPostStatus.PUBLISHED } });
  }

  findById(id: string) {
    return this.prisma.portalFeedPost.findUnique({ where: { id }, include: POST_INCLUDE });
  }

  create(gamadId: string, data: { content: string; imageUrl?: string }) {
    return this.prisma.portalFeedPost.create({
      data: { gamadId, content: data.content, imageUrl: data.imageUrl },
      include: POST_INCLUDE,
    });
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

  async delete(id: string, gamadId: string) {
    return this.prisma.portalFeedPost.updateMany({
      where: { id, gamadId },
      data: { status: FeedPostStatus.DELETED },
    });
  }
}
