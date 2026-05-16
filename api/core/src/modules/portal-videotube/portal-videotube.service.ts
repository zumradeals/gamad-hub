import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PortalVideoTubeRepository } from './portal-videotube.repository';
import { ZahabService } from '../zahab/zahab.service';
import { ModuleConfigService } from '../module-config/module-config.service';
import { ModerationStatus } from '@prisma/client';

@Injectable()
export class PortalVideoTubeService {
  constructor(
    private readonly repo: PortalVideoTubeRepository,
    private readonly zahab: ZahabService,
    private readonly config: ModuleConfigService,
  ) {}

  /* ── Listing public ── */

  async listVideos(opts: { page: number; category?: string; search?: string; sort?: string }) {
    const take = 18;
    const skip = (opts.page - 1) * take;
    const sort: 'popular' | 'recent' = opts.sort === 'popular' ? 'popular' : 'recent';
    const [videos, total] = await Promise.all([
      this.repo.findPublished({ skip, take, category: opts.category, search: opts.search, sort }),
      this.repo.countPublished({ category: opts.category, search: opts.search }),
    ]);
    return { videos, total, page: opts.page, pages: Math.ceil(total / take) };
  }

  getTrendingVideos() {
    return this.repo.findTrending();
  }

  getGamadTvVideos() {
    return this.repo.findGamadTvVideos();
  }

  getCategories() {
    return this.repo.findCategories();
  }

  async getVideoBySlug(slug: string, viewerId?: string) {
    const video = await this.repo.findBySlug(slug);
    if (!video || video.status !== 'PUBLISHED' || video.moderationStatus !== 'APPROVED') {
      throw new NotFoundException('Vidéo introuvable');
    }
    await this.repo.incrementViewCount(video.id);

    let alreadyWatched = false;
    let alreadyLiked = false;
    if (viewerId) {
      const [watch, like] = await Promise.all([
        this.repo.findWatch(video.id, viewerId),
        this.repo.findLike(video.id, viewerId),
      ]);
      alreadyWatched = !!watch;
      alreadyLiked = !!like;
    }

    const comments = await this.repo.findComments(video.id);
    return { video, comments, alreadyWatched, alreadyLiked };
  }

  /* ── Watch reward (idempotent) ── */

  async markWatched(videoId: string, gamadId: string) {
    const existing = await this.repo.findWatch(videoId, gamadId);
    if (existing) return { rewarded: false };

    const video = await this.repo.findById(videoId);
    if (!video) throw new NotFoundException('Vidéo introuvable');

    await this.repo.createWatch(videoId, gamadId);
    await this.repo.incrementViewCount(videoId);
    await this.repo.incrementWatchReward(videoId);

    await this.zahab.onVideoWatched(gamadId, videoId);

    const updated = await this.repo.findById(videoId);
    if (updated && video.authorId) {
      if (updated.viewCount >= 100 && !updated.milestone100) {
        await this.repo.setMilestone100(videoId);
        await this.zahab.onVideoMilestone(video.authorId, videoId, '100');
      }
      if (updated.viewCount >= 1000 && !updated.milestone1k) {
        await this.repo.setMilestone1k(videoId);
        await this.zahab.onVideoMilestone(video.authorId, videoId, '1k');
      }
      if (updated.viewCount >= 10000 && !updated.milestone10k) {
        await this.repo.setMilestone10k(videoId);
        await this.zahab.onVideoMilestone(video.authorId, videoId, '10k');
      }
    }

    return { rewarded: true };
  }

  /* ── Like ── */

  async toggleLike(videoId: string, gamadId: string) {
    const video = await this.repo.findById(videoId);
    if (!video) throw new NotFoundException('Vidéo introuvable');

    const action = await this.repo.toggleLike(videoId, gamadId);

    if (action === 'liked' && video.authorId) {
      await this.zahab.onVideoLiked(gamadId, video.authorId, videoId);
    }

    return { action };
  }

  /* ── Comments ── */

  async addComment(videoId: string, gamadId: string, content: string) {
    const video = await this.repo.findById(videoId);
    if (!video) throw new NotFoundException('Vidéo introuvable');

    const comment = await this.repo.createComment(videoId, gamadId, content);
    await this.zahab.onCommentPosted(gamadId, videoId);
    return comment;
  }

  async deleteComment(commentId: string, gamadId: string) {
    return this.repo.deleteComment(commentId, gamadId);
  }

  /* ── Submit video (author) ── */

  async submitVideo(authorId: string, data: {
    title: string; youtubeUrl: string; description?: string;
    thumbnailUrl?: string; tags?: string[]; durationMin?: number;
    sponsored?: boolean; sponsorName?: string; categoryId?: string; channelId?: string;
  }) {
    const autoMod = await this.config.getBoolean('VIDEOTUBE', 'auto_moderation');
    const minTrust = await this.config.get('VIDEOTUBE', 'min_trust_to_publish');

    const rep = await this.repo.findAuthorTrust(authorId);
    const trustLevel = rep?.trustLevel ?? 'NEWCOMER';
    const trustOrder = ['NEWCOMER', 'MEMBER', 'TRUSTED', 'VETERAN', 'GUARDIAN'];
    const canAutoPublish = autoMod && trustOrder.indexOf(trustLevel) >= trustOrder.indexOf(minTrust);

    const moderationStatus = canAutoPublish ? ModerationStatus.APPROVED : ModerationStatus.PENDING;
    const video = await this.repo.create({ ...data, authorId });
    await this.repo.submit(video.id, authorId, moderationStatus);

    if (moderationStatus === ModerationStatus.APPROVED) {
      await this.zahab.onVideoPublished(authorId, video.id);
    }

    return { ...video, moderationStatus };
  }

  findMyVideos(authorId: string) {
    return this.repo.findMyVideos(authorId);
  }

  async updateVideo(authorId: string, videoId: string, data: any) {
    await this.repo.updateVideo(videoId, authorId, data);
    return { ok: true };
  }

  async deleteVideo(authorId: string, videoId: string) {
    await this.repo.softDeleteVideo(videoId, authorId);
    return { ok: true };
  }

  getStudioStats(authorId: string) {
    return this.repo.getCreatorStats(authorId);
  }

  /* ── Channel ── */

  async getMyChannel(gamadId: string) {
    return this.repo.findChannelByGamadId(gamadId);
  }

  async upsertChannel(gamadId: string, data: {
    name: string; slug: string; description?: string;
    avatarUrl?: string; bannerUrl?: string;
  }) {
    const existing = await this.repo.findChannelByGamadId(gamadId);
    if (existing) {
      await this.repo.updateChannel(existing.id, gamadId, data);
      return this.repo.findChannelByGamadId(gamadId);
    }
    return this.repo.createChannel(gamadId, data);
  }

  getChannelBySlug(slug: string) {
    return this.repo.findChannelBySlug(slug);
  }

  /* ── Editorial queue ── */

  async getPendingReview() {
    return this.repo.findPendingReview();
  }

  async reviewVideo(id: string, editorId: string, decision: 'approve' | 'reject', note?: string) {
    const isEditor = await this.config.hasRole('VIDEOTUBE', editorId, 'EDITOR');
    if (!isEditor) throw new ForbiddenException('Rôle éditeur requis');

    if (decision === 'approve') {
      const video = await this.repo.approveVideo(id, editorId);
      if (video.authorId) {
        await this.zahab.onVideoPublished(video.authorId, id);
      }
      return video;
    } else {
      return this.repo.rejectVideo(id, editorId, note ?? 'Non conforme');
    }
  }
}
