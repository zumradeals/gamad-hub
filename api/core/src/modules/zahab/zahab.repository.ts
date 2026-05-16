import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ZahabTransactionReason, TrustLevel } from '@prisma/client';

// Règles de récompense (en Zahab Points)
export const REWARD_RULES: Record<string, number> = {
  REGISTRATION_BONUS:    10,
  CONTENT_PUBLISHED:      5,
  CONTENT_REWARD:         2,
  COMMENT_REWARD:         1,
  REACTION_RECEIVED:    0.5,
  ARTICLE_PUBLISHED:     20,
  ARTICLE_MILESTONE_100: 10,
  ARTICLE_MILESTONE_1K:  50,
  ARTICLE_READ:         0.5,
  ARTICLE_LIKED:        0.2,
};

// Seuils de trustLevel par score cumulé
const TRUST_THRESHOLDS: [TrustLevel, number][] = [
  [TrustLevel.GUARDIAN, 5000],
  [TrustLevel.VETERAN,  1000],
  [TrustLevel.TRUSTED,   200],
  [TrustLevel.MEMBER,     50],
  [TrustLevel.NEWCOMER,    0],
];

export function computeTrustLevel(score: number): TrustLevel {
  for (const [level, threshold] of TRUST_THRESHOLDS) {
    if (score >= threshold) return level;
  }
  return TrustLevel.NEWCOMER;
}

@Injectable()
export class ZahabRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── Wallet ──────────────────────────────────────────────────────────────────

  async getOrCreateWallet(gamadId: string) {
    return this.prisma.zahabWallet.upsert({
      where: { gamadId },
      create: { gamadId, balance: 0, lockedAmount: 0, totalEarned: 0, totalSpent: 0 },
      update: {},
    });
  }

  findWallet(gamadId: string) {
    return this.prisma.zahabWallet.findUnique({ where: { gamadId } });
  }

  async credit(gamadId: string, amount: number) {
    return this.prisma.zahabWallet.update({
      where: { gamadId },
      data: {
        balance:     { increment: amount },
        totalEarned: { increment: amount },
      },
    });
  }

  async debit(gamadId: string, amount: number) {
    return this.prisma.zahabWallet.update({
      where: { gamadId },
      data: {
        balance:    { decrement: amount },
        totalSpent: { increment: amount },
      },
    });
  }

  // ── Transactions ─────────────────────────────────────────────────────────────

  async createTransaction(data: {
    fromId?: string;
    toId: string;
    amount: number;
    reason: ZahabTransactionReason;
    referenceId?: string;
    note?: string;
  }) {
    return this.prisma.zahabTransaction.create({ data });
  }

  findTransactions(gamadId: string, take = 20) {
    return this.prisma.zahabTransaction.findMany({
      where: { OR: [{ fromId: gamadId }, { toId: gamadId }] },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  // ── Réputation ───────────────────────────────────────────────────────────────

  async getOrCreateReputation(gamadId: string) {
    return this.prisma.reputationScore.upsert({
      where: { gamadId },
      create: { gamadId },
      update: {},
    });
  }

  async incrementReputation(gamadId: string, points: number, field: 'contentScore' | 'engagementScore') {
    const current = await this.getOrCreateReputation(gamadId);
    const newScore = current.score + points;
    const newTrust = computeTrustLevel(newScore);

    return this.prisma.reputationScore.update({
      where: { gamadId },
      data: {
        score: { increment: points },
        [field]: { increment: points },
        trustLevel: newTrust,
      },
    });
  }

  async decrementReputation(gamadId: string, points: number) {
    const current = await this.getOrCreateReputation(gamadId);
    const newScore = Math.max(0, current.score - points);
    const newTrust = computeTrustLevel(newScore);
    return this.prisma.reputationScore.update({
      where: { gamadId },
      data: { score: newScore, trustLevel: newTrust },
    });
  }

  async incrementStats(gamadId: string, field: 'totalPosts' | 'totalComments' | 'totalReactions' | 'totalReported' | 'totalFlagged') {
    return this.prisma.reputationScore.update({
      where: { gamadId },
      data: { [field]: { increment: 1 } },
    });
  }

  findReputation(gamadId: string) {
    return this.prisma.reputationScore.findUnique({ where: { gamadId } });
  }
}
