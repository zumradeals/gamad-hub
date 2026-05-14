import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PortalFeedRepository } from './portal-feed.repository';
import { CreateFeedPostDto } from './dto/create-feed-post.dto';

@Injectable()
export class PortalFeedService {
  constructor(private readonly repo: PortalFeedRepository) {}

  async getFeed(page: number) {
    const take = 20;
    const skip = (page - 1) * take;
    const [posts, total] = await Promise.all([this.repo.findAll({ skip, take }), this.repo.count()]);
    return { posts, total, page, pages: Math.ceil(total / take) };
  }

  createPost(gamadId: string, dto: CreateFeedPostDto) {
    return this.repo.create(gamadId, dto);
  }

  async react(postId: string, gamadId: string, emoji: string) {
    const post = await this.repo.findById(postId);
    if (!post) throw new NotFoundException('Post introuvable');
    return this.repo.toggleReaction(postId, gamadId, emoji);
  }

  async deletePost(postId: string, gamadId: string) {
    const post = await this.repo.findById(postId);
    if (!post) throw new NotFoundException('Post introuvable');
    if (post.gamadId !== gamadId) throw new ForbiddenException('Action non autorisée');
    await this.repo.delete(postId, gamadId);
    return { message: 'Post supprimé' };
  }
}
