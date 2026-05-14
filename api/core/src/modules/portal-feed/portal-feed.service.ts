import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PortalFeedRepository } from './portal-feed.repository';
import { CreateFeedPostDto } from './dto/create-feed-post.dto';
import { ZahabService } from '../zahab/zahab.service';

@Injectable()
export class PortalFeedService {
  constructor(
    private readonly repo: PortalFeedRepository,
    private readonly zahab: ZahabService,
  ) {}

  async getFeed(page: number) {
    const take = 20;
    const skip = (page - 1) * take;
    const [posts, total] = await Promise.all([this.repo.findAll({ skip, take }), this.repo.count()]);
    return { posts, total, page, pages: Math.ceil(total / take) };
  }

  async createPost(gamadId: string, dto: CreateFeedPostDto) {
    const post = await this.repo.create(gamadId, dto);
    // Récompense Zahab pour publication (fire-and-forget)
    this.zahab.onContentPublished(gamadId, post.id).catch(() => {});
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
