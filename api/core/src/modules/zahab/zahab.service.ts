import { Injectable, BadRequestException } from '@nestjs/common';
import { ZahabRepository, REWARD_RULES } from './zahab.repository';
import { ZahabTransactionReason } from '@prisma/client';

@Injectable()
export class ZahabService {
  constructor(private readonly repo: ZahabRepository) {}

  // ── Lecture ──────────────────────────────────────────────────────────────────

  async getTrustLevel(gamadId: string): Promise<string> {
    const rep = await this.repo.getOrCreateReputation(gamadId);
    return rep.trustLevel;
  }

  async getMyWallet(gamadId: string) {
    const [wallet, reputation, transactions] = await Promise.all([
      this.repo.getOrCreateWallet(gamadId),
      this.repo.getOrCreateReputation(gamadId),
      this.repo.findTransactions(gamadId, 10),
    ]);
    return { wallet, reputation, transactions };
  }

  async getTransactions(gamadId: string) {
    return this.repo.findTransactions(gamadId, 50);
  }

  // ── Récompenses automatiques ─────────────────────────────────────────────────

  /**
   * Appelé à l'inscription sur le portail.
   * Crée le wallet + réputation + crédit bonus de bienvenue.
   */
  async onRegistration(gamadId: string) {
    await this.repo.getOrCreateWallet(gamadId);
    await this.repo.getOrCreateReputation(gamadId);
    const amount = REWARD_RULES['REGISTRATION_BONUS'];
    await this.repo.credit(gamadId, amount);
    await this.repo.createTransaction({
      toId: gamadId,
      amount,
      reason: ZahabTransactionReason.REGISTRATION_BONUS,
      note: 'Bonus de bienvenue GAMAD',
    });
  }

  /**
   * Appelé quand un post est publié sur le feed.
   */
  async onContentPublished(gamadId: string, referenceId: string) {
    const amount = REWARD_RULES['CONTENT_PUBLISHED'];
    await this.repo.getOrCreateWallet(gamadId);
    await this.repo.credit(gamadId, amount);
    await this.repo.createTransaction({
      toId: gamadId,
      amount,
      reason: ZahabTransactionReason.CONTENT_PUBLISHED,
      referenceId,
      note: 'Publication de contenu',
    });
    await this.repo.getOrCreateReputation(gamadId);
    await this.repo.incrementReputation(gamadId, amount, 'contentScore');
    await this.repo.incrementStats(gamadId, 'totalPosts');
  }

  /**
   * Appelé quand une réaction est reçue sur un post.
   * Récompense l'auteur du contenu.
   */
  async onReactionReceived(authorId: string, referenceId: string) {
    const amount = REWARD_RULES['REACTION_RECEIVED'];
    await this.repo.getOrCreateWallet(authorId);
    await this.repo.credit(authorId, amount);
    await this.repo.createTransaction({
      toId: authorId,
      amount,
      reason: ZahabTransactionReason.REACTION_RECEIVED,
      referenceId,
    });
    await this.repo.getOrCreateReputation(authorId);
    await this.repo.incrementReputation(authorId, 1, 'engagementScore');
    await this.repo.incrementStats(authorId, 'totalReactions');
  }

  /**
   * Appelé quand un commentaire constructif est posté.
   */
  async onCommentPosted(gamadId: string, referenceId: string) {
    const amount = REWARD_RULES['COMMENT_REWARD'];
    await this.repo.getOrCreateWallet(gamadId);
    await this.repo.credit(gamadId, amount);
    await this.repo.createTransaction({
      toId: gamadId,
      amount,
      reason: ZahabTransactionReason.COMMENT_REWARD,
      referenceId,
    });
    await this.repo.getOrCreateReputation(gamadId);
    await this.repo.incrementReputation(gamadId, amount, 'engagementScore');
    await this.repo.incrementStats(gamadId, 'totalComments');
  }

  /**
   * Appelé quand un article blog est approuvé et publié.
   */
  async onArticlePublished(gamadId: string, referenceId: string) {
    const amount = REWARD_RULES['ARTICLE_PUBLISHED'];
    await this.repo.getOrCreateWallet(gamadId);
    await this.repo.credit(gamadId, amount);
    await this.repo.createTransaction({
      toId: gamadId,
      amount,
      reason: ZahabTransactionReason.ARTICLE_PUBLISHED,
      referenceId,
      note: 'Article de blog publié',
    });
    await this.repo.getOrCreateReputation(gamadId);
    await this.repo.incrementReputation(gamadId, 10, 'contentScore');
    await this.repo.incrementStats(gamadId, 'totalPosts');
  }

  /**
   * Appelé quand un article atteint un palier de vues (100 ou 1000).
   */
  async onArticleMilestone(gamadId: string, referenceId: string, milestone: '100' | '1k') {
    const key = milestone === '100' ? 'ARTICLE_MILESTONE_100' : 'ARTICLE_MILESTONE_1K';
    const reason = milestone === '100'
      ? ZahabTransactionReason.ARTICLE_MILESTONE_100
      : ZahabTransactionReason.ARTICLE_MILESTONE_1K;
    const amount = REWARD_RULES[key];
    await this.repo.getOrCreateWallet(gamadId);
    await this.repo.credit(gamadId, amount);
    await this.repo.createTransaction({
      toId: gamadId,
      amount,
      reason,
      referenceId,
      note: `Palier ${milestone === '100' ? '100' : '1 000'} vues atteint`,
    });
  }

  // ── Pénalités de modération ──────────────────────────────────────────────────

  /** Signalement validé — -5 pts à l'auteur, incrément totalReported */
  async onContentReported(authorId: string) {
    await this.repo.getOrCreateReputation(authorId);
    await this.repo.decrementReputation(authorId, 5);
    await this.repo.incrementStats(authorId, 'totalReported');
  }

  /** Contenu rejeté par modérateur — -10 pts à l'auteur, incrément totalFlagged */
  async onContentRejected(authorId: string) {
    await this.repo.getOrCreateReputation(authorId);
    await this.repo.decrementReputation(authorId, 10);
    await this.repo.incrementStats(authorId, 'totalFlagged');
  }

  // ── Transfert entre membres ──────────────────────────────────────────────────

  async transfer(fromId: string, toId: string, amount: number, note?: string) {
    if (amount <= 0) throw new BadRequestException('Montant invalide');
    const wallet = await this.repo.findWallet(fromId);
    if (!wallet || wallet.balance < amount) {
      throw new BadRequestException('Solde insuffisant');
    }
    await this.repo.debit(fromId, amount);
    await this.repo.credit(toId, amount);
    return this.repo.createTransaction({
      fromId,
      toId,
      amount,
      reason: ZahabTransactionReason.MANUAL_CREDIT,
      note,
    });
  }
}
