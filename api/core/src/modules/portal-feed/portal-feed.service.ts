import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PortalFeedRepository } from './portal-feed.repository';
import { CreateFeedPostDto } from './dto/create-feed-post.dto';
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

  async getFeed(page: number) {
    const take = 20;
    const skip = (page - 1) * take;
    const [posts, total] = await Promise.all([this.repo.findAll({ skip, take }), this.repo.count()]);
    return { posts, total, page, pages: Math.ceil(total / take) };
  }

  async createPost(gamadId: string, dto: CreateFeedPostDto, trustLevel?: string) {
    if (!trustLevel) {
      trustLevel = await this.zahab.getTrustLevel(gamadId);
    }
    // Filtre de contenu synchrone
    const filter = await this.moderation.filterContent(dto.content);
    if (!filter.allowed) {
      throw new BadRequestException(filter.reason ?? 'Contenu non autorisé');
    }

    // Statut de modération selon trustLevel et filtre
    let moderationStatus: 'PENDING' | 'APPROVED' | 'FLAGGED' = 'PENDING';
    if (filter.action === 'flag') {
      moderationStatus = 'PENDING'; // Force la modération même pour TRUSTED+
    } else if (['TRUSTED', 'VETERAN', 'GUARDIAN'].includes(trustLevel)) {
      moderationStatus = 'APPROVED';
    }

    const post = await this.repo.createWithStatus(gamadId, dto, moderationStatus);

    // Récompense ZAHAB uniquement si directement approuvé
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
    // Récompenser l'auteur du contenu si c'est un ajout de réaction
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
}
