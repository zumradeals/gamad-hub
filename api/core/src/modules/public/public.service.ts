import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PublicRepository } from './public.repository';
import { AuditService } from '../audit/audit.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { CreateVideoDto } from './dto/create-video.dto';

@Injectable()
export class PublicService {
  constructor(
    private readonly repo: PublicRepository,
    private readonly audit: AuditService,
  ) {}

  // ── G-SEARCH ──────────────────────────────────────────────────────────────

  async search(dto: SearchQueryDto) {
    const skip = dto.skip ?? 0;
    const take = dto.take ?? 20;
    const all = await this.repo.search(dto.q, skip, take);

    if (!dto.type || dto.type === 'all') return all;

    return {
      articles: dto.type === 'articles' ? all.articles : [],
      videos: dto.type === 'videos' ? all.videos : [],
      formations: dto.type === 'formations' ? all.formations : [],
      resources: dto.type === 'resources' ? all.resources : [],
    };
  }

  // ── Articles ──────────────────────────────────────────────────────────────

  findArticleCategories() {
    return this.repo.findArticleCategories();
  }

  findPublishedArticles(opts?: { categorySlug?: string; skip?: number; take?: number }) {
    return this.repo.findPublishedArticles(opts);
  }

  async findArticleBySlug(slug: string) {
    const article = await this.repo.findArticleBySlug(slug);
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }

  // ── Videos ────────────────────────────────────────────────────────────────

  findVideoCategories() {
    return this.repo.findVideoCategories();
  }

  findPublishedVideos(opts?: { categorySlug?: string; skip?: number; take?: number }) {
    return this.repo.findPublishedVideos(opts);
  }

  async findVideoBySlug(slug: string) {
    const video = await this.repo.findVideoBySlug(slug);
    if (!video) throw new NotFoundException('Video not found');
    return video;
  }

  // ── Formations ────────────────────────────────────────────────────────────

  findPublicFormations(opts?: { skip?: number; take?: number }) {
    return this.repo.findPublicFormations(opts);
  }

  async findPublicFormationBySlug(slug: string) {
    const formation = await this.repo.findPublicFormationBySlug(slug);
    if (!formation) throw new NotFoundException('Formation not found');
    return formation;
  }

  // ── Resources ─────────────────────────────────────────────────────────────

  findPublicDocuments(opts?: { skip?: number; take?: number }) {
    return this.repo.findPublicDocuments(opts);
  }

  // ── Admin: Content management ─────────────────────────────────────────────

  async createArticle(actorId: string, dto: CreateArticleDto) {
    const article = await this.repo.createArticle(dto);
    await this.audit.createEvent({
      actorId,
      action: 'ARTICLE_CREATED',
      targetType: 'Article',
      targetId: article.id,
      metadata: { title: article.title },
    });
    return article;
  }

  async publishArticle(actorId: string, id: string) {
    const article = await this.repo.updateArticleStatus(id, 'PUBLISHED' as any);
    await this.audit.createEvent({
      actorId,
      action: 'ARTICLE_PUBLISHED',
      targetType: 'Article',
      targetId: id,
    });
    return article;
  }

  async archiveArticle(actorId: string, id: string) {
    const article = await this.repo.updateArticleStatus(id, 'ARCHIVED' as any);
    await this.audit.createEvent({
      actorId,
      action: 'ARTICLE_ARCHIVED',
      targetType: 'Article',
      targetId: id,
    });
    return article;
  }

  async createVideo(actorId: string, dto: CreateVideoDto) {
    const video = await this.repo.createVideo(dto);
    await this.audit.createEvent({
      actorId,
      action: 'VIDEO_CREATED',
      targetType: 'Video',
      targetId: video.id,
      metadata: { title: video.title },
    });
    return video;
  }

  async publishVideo(actorId: string, id: string) {
    const video = await this.repo.updateVideoStatus(id, 'PUBLISHED' as any);
    await this.audit.createEvent({
      actorId,
      action: 'VIDEO_PUBLISHED',
      targetType: 'Video',
      targetId: id,
    });
    return video;
  }

  async archiveVideo(actorId: string, id: string) {
    const video = await this.repo.updateVideoStatus(id, 'ARCHIVED' as any);
    await this.audit.createEvent({
      actorId,
      action: 'VIDEO_ARCHIVED',
      targetType: 'Video',
      targetId: id,
    });
    return video;
  }
}
