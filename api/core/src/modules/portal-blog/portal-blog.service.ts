import {
  Injectable, NotFoundException, ForbiddenException,
  BadRequestException, Inject, forwardRef,
} from '@nestjs/common';
import { PortalBlogRepository } from './portal-blog.repository';
import { ZahabService } from '../zahab/zahab.service';
import { ModerationService } from '../moderation/moderation.service';
import { ModuleConfigService } from '../module-config/module-config.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ReviewArticleDto } from './dto/review-article.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ModerationStatus } from '@prisma/client';

const MODULE = 'BLOG';
const TRUSTED_LEVELS = ['TRUSTED', 'VETERAN', 'GUARDIAN'];

@Injectable()
export class PortalBlogService {
  constructor(
    private readonly repo: PortalBlogRepository,
    private readonly zahab: ZahabService,
    private readonly config: ModuleConfigService,
    @Inject(forwardRef(() => ModerationService))
    private readonly moderation: ModerationService,
  ) {}

  /* ── Listing public ── */

  async getPublished(page: number, opts: { category?: string; search?: string; sort?: string }) {
    const take = 20;
    const skip = (page - 1) * take;
    const sort: 'popular' | 'recent' = opts.sort === 'popular' ? 'popular' : 'recent';
    const { sort: _s, ...rest } = opts;
    const [articles, total] = await Promise.all([
      this.repo.findPublished({ skip, take, sort, ...rest }),
      this.repo.countPublished(opts),
    ]);
    return { articles, total, page, pages: Math.ceil(total / take) };
  }

  getTrending() {
    return this.repo.findTrending();
  }

  getCategories() {
    return this.repo.findCategories();
  }

  async getBySlug(slug: string) {
    const article = await this.repo.findBySlug(slug);
    if (!article || article.status !== 'PUBLISHED' || article.moderationStatus !== ModerationStatus.APPROVED) {
      throw new NotFoundException('Article introuvable');
    }
    this.incrementViewsAndCheckMilestones(article.id, article.viewCount + 1, article.authorId, article.milestone100, article.milestone1k).catch(() => {});
    return article;
  }

  private async incrementViewsAndCheckMilestones(
    articleId: string, newCount: number, authorId: string | null,
    milestone100: boolean, milestone1k: boolean,
  ) {
    await this.repo.incrementViewCount(articleId);
    if (!authorId) return;
    const [reward100, reward1k] = await Promise.all([
      this.config.getNumber(MODULE, 'milestone_100_reward'),
      this.config.getNumber(MODULE, 'milestone_1k_reward'),
    ]);
    if (!milestone100 && newCount >= 100) {
      await this.repo.setMilestone100(articleId);
      await this.repo.markZahabRewarded(articleId, reward100);
      this.zahab.onArticleMilestone(authorId, articleId, '100').catch(() => {});
    } else if (!milestone1k && newCount >= 1000) {
      await this.repo.setMilestone1k(articleId);
      await this.repo.markZahabRewarded(articleId, reward1k);
      this.zahab.onArticleMilestone(authorId, articleId, '1k').catch(() => {});
    }
  }

  /* ── Read reward (lecteur) — idempotent ── */

  async markRead(slug: string, gamadId: string) {
    const article = await this.repo.findBySlug(slug);
    if (!article || article.status !== 'PUBLISHED' || article.moderationStatus !== ModerationStatus.APPROVED) {
      throw new NotFoundException('Article introuvable');
    }
    const existing = await this.repo.findRead(article.id, gamadId);
    if (existing) return { rewarded: false, alreadyRead: true };

    await this.repo.createRead(article.id, gamadId);
    await this.repo.incrementReadReward(article.id);
    const amount = await this.config.getNumber(MODULE, 'reader_reward_amount');
    this.zahab.onArticleRead(gamadId, article.id).catch(() => {});
    return { rewarded: true, amount };
  }

  /* ── Likes ── */

  async toggleLike(slug: string, gamadId: string) {
    const article = await this.repo.findBySlug(slug);
    if (!article || article.status !== 'PUBLISHED') throw new NotFoundException('Article introuvable');
    const action = await this.repo.toggleLike(article.id, gamadId);
    if (action === 'liked' && article.authorId && article.authorId !== gamadId) {
      this.zahab.onArticleLiked(article.authorId, article.id).catch(() => {});
    }
    return { action };
  }

  /* ── Comments ── */

  getComments(slug: string) {
    return this.repo.findBySlug(slug).then((a) => {
      if (!a) throw new NotFoundException('Article introuvable');
      return this.repo.findComments(a.id);
    });
  }

  async addComment(slug: string, gamadId: string, dto: CreateCommentDto) {
    const article = await this.repo.findBySlug(slug);
    if (!article || article.status !== 'PUBLISHED') throw new NotFoundException('Article introuvable');
    const comment = await this.repo.createComment(article.id, gamadId, dto.content);
    this.zahab.onCommentPosted(gamadId, article.id).catch(() => {});
    return comment;
  }

  async deleteComment(slug: string, commentId: string, gamadId: string) {
    const article = await this.repo.findBySlug(slug);
    if (!article) throw new NotFoundException('Article introuvable');
    await this.repo.deleteComment(commentId, gamadId);
    return { message: 'Commentaire supprimé' };
  }

  /* ── Author CRUD ── */

  async create(dto: CreateArticleDto, authorId: string) {
    const minTrust = await this.config.get(MODULE, 'min_trust_to_write');
    const trustLevel = await this.zahab.getTrustLevel(authorId);
    if (!TRUSTED_LEVELS.includes(trustLevel) && trustLevel !== minTrust) {
      throw new ForbiddenException(`Niveau de réputation insuffisant (requis : ${minTrust})`);
    }
    const filter = await this.moderation.filterContent(dto.content);
    if (!filter.allowed) throw new BadRequestException(filter.reason ?? 'Contenu non autorisé');
    return this.repo.create({ ...dto, authorId });
  }

  async update(id: string, dto: UpdateArticleDto, authorId: string) {
    const article = await this.repo.findById(id);
    if (!article) throw new NotFoundException('Article introuvable');
    if (article.authorId !== authorId) throw new ForbiddenException();
    await this.repo.update(id, authorId, dto);
    return this.repo.findById(id);
  }

  async remove(id: string, authorId: string) {
    const article = await this.repo.findById(id);
    if (!article) throw new NotFoundException('Article introuvable');
    if (article.authorId !== authorId) throw new ForbiddenException();
    await this.repo.softDelete(id, authorId);
    return { message: 'Article archivé' };
  }

  async submit(id: string, authorId: string) {
    const article = await this.repo.findById(id);
    if (!article) throw new NotFoundException('Article introuvable');
    if (article.authorId !== authorId) throw new ForbiddenException();

    const filter = await this.moderation.filterContent(article.content);
    if (!filter.allowed) throw new BadRequestException(filter.reason ?? 'Contenu non autorisé');

    const trustLevel = await this.zahab.getTrustLevel(authorId);
    const autoApprove = filter.action !== 'flag' && TRUSTED_LEVELS.includes(trustLevel);
    const isAutoApprove = await this.config.getBoolean(MODULE, 'auto_moderation')
      ? autoApprove
      : false;

    await this.repo.submit(id, authorId, isAutoApprove ? ModerationStatus.APPROVED : ModerationStatus.PENDING);

    const updated = await this.repo.findById(id);
    if (updated?.moderationStatus === ModerationStatus.APPROVED && !updated.zahabRewarded) {
      const reward = await this.config.getNumber(MODULE, 'author_publish_reward');
      await this.repo.markZahabRewarded(id, reward);
      this.zahab.onArticlePublished(authorId, id).catch(() => {});
    }
    return updated;
  }

  getMyArticles(authorId: string) {
    return this.repo.findMyArticles(authorId);
  }

  getMyStats(authorId: string) {
    return this.repo.getMyStats(authorId);
  }

  /* ── Editorial (EDITOR role) ── */

  getPendingReview() {
    return this.repo.findPendingReview();
  }

  async reviewArticle(id: string, editorId: string, dto: ReviewArticleDto) {
    const article = await this.repo.findById(id);
    if (!article) throw new NotFoundException('Article introuvable');

    if (dto.action === 'approve') {
      await this.repo.approveArticle(id, editorId);
      if (article.authorId && !article.zahabRewarded) {
        const reward = await this.config.getNumber(MODULE, 'author_publish_reward');
        await this.repo.markZahabRewarded(id, reward);
        this.zahab.onArticlePublished(article.authorId, id).catch(() => {});
      }
      return { message: 'Article publié' };
    } else {
      if (!dto.note) throw new BadRequestException('Note de refus obligatoire');
      await this.repo.rejectArticle(id, editorId, dto.note);
      return { message: 'Article refusé' };
    }
  }
}
