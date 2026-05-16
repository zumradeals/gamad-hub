import {
  Injectable, NotFoundException, ForbiddenException,
  BadRequestException, Inject, forwardRef,
} from '@nestjs/common';
import { PortalFeedRepository } from './portal-feed.repository';
import { CreateFeedPostDto } from './dto/create-feed-post.dto';
import { CreateFeedCommentDto } from './dto/create-feed-comment.dto';
import { ZahabService } from '../zahab/zahab.service';
import { ModerationService } from '../moderation/moderation.service';

@Injectable()
export class PortalFeedService {
  constructor(
    private readonly repo: PortalFeedRepository,
    private readonly zahab: ZahabService,
    @Inject(forwardRef(() => ModerationService))
    private readonly moderation: ModerationService,
  ) {}

  async getFeed(page: number, sort?: string, hashtag?: string) {
    const take = 20;
    const skip = (page - 1) * take;
    const sortMode = sort === 'popular' ? 'popular' : 'recent';
    const tag = hashtag?.replace(/^#/, '');
    const [posts, total] = await Promise.all([
      this.repo.findAll({ skip, take, hashtag: tag, sort: sortMode }),
      this.repo.count(tag),
    ]);
    return { posts, total, page, pages: Math.ceil(total / take) };
  }

  async getPost(id: string) {
    const post = await this.repo.findById(id);
    if (!post) throw new NotFoundException('Post introuvable');
    return post;
  }

  async createPost(gamadId: string, dto: CreateFeedPostDto, trustLevel?: string) {
    if (!trustLevel) {
      trustLevel = await this.zahab.getTrustLevel(gamadId);
    }
    const filter = await this.moderation.filterContent(dto.content);
    if (!filter.allowed) {
      throw new BadRequestException(filter.reason ?? 'Contenu non autorisé');
    }

    let moderationStatus: 'PENDING' | 'APPROVED' | 'FLAGGED' = 'PENDING';
    if (filter.action === 'flag') {
      moderationStatus = 'PENDING';
    } else if (['TRUSTED', 'VETERAN', 'GUARDIAN'].includes(trustLevel)) {
      moderationStatus = 'APPROVED';
    }

    const post = await this.repo.createWithStatus(gamadId, dto, moderationStatus);

    if (moderationStatus === 'APPROVED') {
      this.zahab.onContentPublished(gamadId, post.id).catch(() => {});
      await this.repo.markZahabRewarded(post.id);
    }
    return post;
  }

  async react(postId: string, gamadId: string, emoji: string) {
    const post = await this.repo.findById(postId);
    if (!post) throw new NotFoundException('Post introuvable');
    const result = await this.repo.toggleReaction(postId, gamadId, emoji);
    if (result.action === 'added' && post.gamadId !== gamadId) {
      this.zahab.onReactionReceived(post.gamadId, postId).catch(() => {});
    }
    return result;
  }

  async deletePost(postId: string, gamadId: string) {
    const post = await this.repo.findById(postId);
    if (!post) throw new NotFoundException('Post introuvable');
    if (post.gamadId !== gamadId) throw new ForbiddenException('Action non autorisée');
    await this.repo.delete(postId, gamadId);
    return { message: 'Post supprimé' };
  }

  /* ── Comments ── */

  async getComments(postId: string) {
    const post = await this.repo.findById(postId);
    if (!post) throw new NotFoundException('Post introuvable');
    return this.repo.findComments(postId);
  }

  async addComment(gamadId: string, postId: string, dto: CreateFeedCommentDto) {
    const post = await this.repo.findById(postId);
    if (!post) throw new NotFoundException('Post introuvable');
    const comment = await this.repo.createComment(gamadId, postId, dto.content);
    this.zahab.onCommentPosted?.(gamadId, postId).catch?.(() => {});
    return comment;
  }

  async deleteComment(commentId: string, gamadId: string) {
    const deleted = await this.repo.deleteComment(commentId, gamadId);
    if (!deleted) throw new ForbiddenException('Commentaire introuvable ou non autorisé');
    return { message: 'Commentaire supprimé' };
  }
}
