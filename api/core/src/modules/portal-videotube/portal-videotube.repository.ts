import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { VideoStatus, ModerationStatus } from '@prisma/client';

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
}

async function uniqueSlug(prisma: PrismaService, base: string): Promise<string> {
  let slug = slugify(base);
  let suffix = 0;
  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const exists = await prisma.gamadTubeVideo.findUnique({ where: { slug: candidate } });
    if (!exists) return candidate;
    suffix++;
  }
}

const VIDEO_SELECT = {
  id: true, slug: true, title: true, description: true,
  youtubeUrl: true, thumbnailUrl: true, tags: true,
  durationMin: true, sponsored: true, sponsorName: true,
  status: true, moderationStatus: true, viewCount: true,
  likesCount: true, watchRewardCount: true, milestone100: true,
  milestone1k: true, milestone10k: true, rewardAmount: true,
  publishedAt: true, createdAt: true,
  category: { select: { id: true, name: true, slug: true } },
  author: { select: { publicCode: true, profile: { select: { displayName: true, avatarUrl: true } } } },
  channel: { select: { id: true, name: true, slug: true, avatarUrl: true } },
};

@Injectable()
export class PortalVideoTubeRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ── Listing public ── */

  findPublished(opts: {
    skip: number; take: number;
    category?: string; search?: string;
    sort?: 'recent' | 'popular';
  }) {
    const where: any = {
      status: VideoStatus.PUBLISHED,
      moderationStatus: ModerationStatus.APPROVED,
    };
    if (opts.category) where.category = { slug: opts.category };
    if (opts.search) {
      where.OR = [
        { title: { contains: opts.search, mode: 'insensitive' } },
        { description: { contains: opts.search, mode: 'insensitive' } },
        { tags: { has: opts.search.toLowerCase() } },
      ];
    }
    const orderBy = opts.sort === 'popular'
      ? [{ viewCount: 'desc' as const }]
      : [{ publishedAt: 'desc' as const }];
    return this.prisma.gamadTubeVideo.findMany({ where, select: VIDEO_SELECT, orderBy, skip: opts.skip, take: opts.take });
  }

  countPublished(opts: { category?: string; search?: string }) {
    const where: any = { status: VideoStatus.PUBLISHED, moderationStatus: ModerationStatus.APPROVED };
    if (opts.category) where.category = { slug: opts.category };
    if (opts.search) where.OR = [{ title: { contains: opts.search, mode: 'insensitive' } }];
    return this.prisma.gamadTubeVideo.count({ where });
  }

  findTrending() {
    return this.prisma.gamadTubeVideo.findMany({
      where: { status: VideoStatus.PUBLISHED, moderationStatus: ModerationStatus.APPROVED },
      select: VIDEO_SELECT,
      orderBy: { viewCount: 'desc' },
      take: 6,
    });
  }

  findBySlug(slug: string) {
    return this.prisma.gamadTubeVideo.findUnique({
      where: { slug },
      include: {
        category: true,
        author: { include: { profile: true } },
        channel: true,
        _count: { select: { comments: true, likes: true, watches: true } },
      },
    });
  }

  findById(id: string) {
    return this.prisma.gamadTubeVideo.findUnique({ where: { id } });
  }

  /* ── Official TV channel (GAMAD TV) ── */

  findGamadTvVideos() {
    return this.prisma.gamadTubeVideo.findMany({
      where: {
        status: VideoStatus.PUBLISHED,
        moderationStatus: ModerationStatus.APPROVED,
        verified: true,
      },
      select: VIDEO_SELECT,
      orderBy: { publishedAt: 'desc' },
      take: 20,
    });
  }

  /* ── Editorial queue ── */

  findPendingReview() {
    return this.prisma.gamadTubeVideo.findMany({
      where: { status: VideoStatus.PUBLISHED, moderationStatus: ModerationStatus.PENDING },
      select: { ...VIDEO_SELECT, description: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  approveVideo(id: string, editorId: string) {
    return this.prisma.gamadTubeVideo.update({
      where: { id },
      data: { moderationStatus: ModerationStatus.APPROVED, editorId },
    });
  }

  rejectVideo(id: string, editorId: string, note: string) {
    return this.prisma.gamadTubeVideo.update({
      where: { id },
      data: {
        moderationStatus: ModerationStatus.REJECTED,
        status: VideoStatus.DRAFT,
        editorId,
        rejectionNote: note,
      },
    });
  }

  /* ── Author CRUD ── */

  async create(data: {
    title: string; youtubeUrl: string; description?: string;
    thumbnailUrl?: string; tags?: string[]; durationMin?: number;
    sponsored?: boolean; sponsorName?: string; sponsorUrl?: string;
    categoryId?: string; channelId?: string; authorId: string;
  }) {
    const slug = await uniqueSlug(this.prisma, data.title);
    return this.prisma.gamadTubeVideo.create({
      data: { ...data, slug, status: VideoStatus.DRAFT, moderationStatus: ModerationStatus.PENDING },
      select: VIDEO_SELECT,
    });
  }

  async submit(id: string, authorId: string, moderationStatus: ModerationStatus) {
    return this.prisma.gamadTubeVideo.updateMany({
      where: { id, authorId, status: { in: [VideoStatus.DRAFT] } },
      data: { status: VideoStatus.PUBLISHED, publishedAt: new Date(), moderationStatus },
    });
  }

  findMyVideos(authorId: string) {
    return this.prisma.gamadTubeVideo.findMany({
      where: { authorId },
      select: { ...VIDEO_SELECT, rejectionNote: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async incrementViewCount(id: string) {
    return this.prisma.gamadTubeVideo.update({ where: { id }, data: { viewCount: { increment: 1 } } });
  }

  async setMilestone100(id: string) {
    return this.prisma.gamadTubeVideo.update({ where: { id }, data: { milestone100: true } });
  }

  async setMilestone1k(id: string) {
    return this.prisma.gamadTubeVideo.update({ where: { id }, data: { milestone1k: true } });
  }

  async setMilestone10k(id: string) {
    return this.prisma.gamadTubeVideo.update({ where: { id }, data: { milestone10k: true } });
  }

  /* ── Watch tracking ── */

  findWatch(videoId: string, gamadId: string) {
    return this.prisma.videoWatch.findUnique({ where: { videoId_gamadId: { videoId, gamadId } } });
  }

  createWatch(videoId: string, gamadId: string) {
    return this.prisma.videoWatch.create({ data: { videoId, gamadId } });
  }

  incrementWatchReward(videoId: string) {
    return this.prisma.gamadTubeVideo.update({ where: { id: videoId }, data: { watchRewardCount: { increment: 1 } } });
  }

  /* ── Likes ── */

  findLike(videoId: string, gamadId: string) {
    return this.prisma.videoLike.findUnique({ where: { videoId_gamadId: { videoId, gamadId } } });
  }

  async toggleLike(videoId: string, gamadId: string): Promise<'liked' | 'unliked'> {
    const existing = await this.findLike(videoId, gamadId);
    if (existing) {
      await this.prisma.videoLike.delete({ where: { videoId_gamadId: { videoId, gamadId } } });
      await this.prisma.gamadTubeVideo.update({ where: { id: videoId }, data: { likesCount: { decrement: 1 } } });
      return 'unliked';
    }
    await this.prisma.videoLike.create({ data: { videoId, gamadId } });
    await this.prisma.gamadTubeVideo.update({ where: { id: videoId }, data: { likesCount: { increment: 1 } } });
    return 'liked';
  }

  /* ── Comments ── */

  findComments(videoId: string) {
    return this.prisma.videoComment.findMany({
      where: { videoId },
      orderBy: { createdAt: 'asc' },
      include: { gamad: { select: { publicCode: true, profile: { select: { displayName: true, avatarUrl: true } } } } },
    });
  }

  createComment(videoId: string, gamadId: string, content: string) {
    return this.prisma.videoComment.create({
      data: { videoId, gamadId, content },
      include: { gamad: { select: { publicCode: true, profile: { select: { displayName: true, avatarUrl: true } } } } },
    });
  }

  deleteComment(commentId: string, gamadId: string) {
    return this.prisma.videoComment.deleteMany({ where: { id: commentId, gamadId } });
  }

  /* ── Categories ── */

  findCategories() {
    return this.prisma.videoCategory.findMany({ orderBy: { name: 'asc' } });
  }

  findAuthorTrust(gamadId: string) {
    return this.prisma.reputationScore.findUnique({ where: { gamadId } });
  }

  /* ── Studio: video management ── */

  updateVideo(id: string, authorId: string, data: Partial<{
    title: string; description: string; thumbnailUrl: string;
    tags: string[]; durationMin: number; sponsored: boolean;
    sponsorName: string; sponsorUrl: string; categoryId: string; channelId: string;
  }>) {
    return this.prisma.gamadTubeVideo.updateMany({
      where: { id, authorId },
      data,
    });
  }

  softDeleteVideo(id: string, authorId: string) {
    return this.prisma.gamadTubeVideo.updateMany({
      where: { id, authorId },
      data: { status: VideoStatus.ARCHIVED },
    });
  }

  async getCreatorStats(authorId: string) {
    const videos = await this.prisma.gamadTubeVideo.findMany({
      where: { authorId, status: VideoStatus.PUBLISHED, moderationStatus: ModerationStatus.APPROVED },
      select: {
        viewCount: true, likesCount: true, watchRewardCount: true,
        rewardAmount: true, milestone100: true, milestone1k: true, milestone10k: true,
        createdAt: true,
      },
    });
    const totalPublished = videos.length;
    const totalViews = videos.reduce((s, v) => s + v.viewCount, 0);
    const totalLikes = videos.reduce((s, v) => s + v.likesCount, 0);
    const totalWatchRewards = videos.reduce((s, v) => s + v.watchRewardCount, 0);
    const totalZahab = videos.reduce((s, v) => s + v.rewardAmount, 0);
    const milestones100 = videos.filter(v => v.milestone100).length;
    const milestones1k  = videos.filter(v => v.milestone1k).length;
    const milestones10k = videos.filter(v => v.milestone10k).length;
    const avgViews = totalPublished ? Math.round(totalViews / totalPublished) : 0;

    const draftCount   = await this.prisma.gamadTubeVideo.count({ where: { authorId, status: VideoStatus.DRAFT } });
    const pendingCount = await this.prisma.gamadTubeVideo.count({ where: { authorId, moderationStatus: ModerationStatus.PENDING } });

    return {
      totalPublished, totalViews, totalLikes, totalWatchRewards,
      totalZahab, avgViews, milestones100, milestones1k, milestones10k,
      draftCount, pendingCount,
    };
  }

  /* ── Studio: channel ── */

  async findChannelByGamadId(gamadId: string) {
    return this.prisma.videoChannel.findFirst({ where: { gamadId } });
  }

  async findChannelBySlug(slug: string) {
    return this.prisma.videoChannel.findUnique({
      where: { slug },
      include: { videos: { where: { status: VideoStatus.PUBLISHED, moderationStatus: ModerationStatus.APPROVED }, select: VIDEO_SELECT, orderBy: { publishedAt: 'desc' }, take: 12 } },
    });
  }

  async createChannel(gamadId: string, data: { name: string; slug: string; description?: string; avatarUrl?: string; bannerUrl?: string }) {
    return this.prisma.videoChannel.create({ data: { ...data, gamadId } });
  }

  async updateChannel(id: string, gamadId: string, data: Partial<{ name: string; slug: string; description: string; avatarUrl: string; bannerUrl: string }>) {
    return this.prisma.videoChannel.updateMany({ where: { id, gamadId }, data });
  }
}
