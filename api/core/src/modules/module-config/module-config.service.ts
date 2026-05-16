import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

// Default values — overridable from DB at runtime
const DEFAULTS: Record<string, Record<string, string>> = {
  BLOG: {
    reader_reward_amount:    '0.5',
    author_publish_reward:   '20',
    milestone_100_reward:    '10',
    milestone_1k_reward:     '50',
    like_reward_author:      '0.2',
    comment_reward:          '1',
    min_trust_to_write:      'TRUSTED',
    auto_moderation:         'true',
    active_categories:       '["POLITIQUE","CULTURE","RELIGION","SOCIETE","SCIENCE","SPORT","GAMAD"]',
  },
  FEED: {
    post_reward:             '5',
    comment_reward:          '1',
    reaction_reward:         '0.5',
  },
  MARKET: {
    buyer_protection_days:   '7',
  },
  ZUMARA: {
    max_members:             '100',
    formation_min_days:      '30',
  },
  VIDEOTUBE: {
    watch_reward_viewer:     '0.5',
    like_reward_viewer:      '0.1',
    like_reward_author:      '0.3',
    publish_reward:          '30',
    milestone_100_reward:    '20',
    milestone_1k_reward:     '100',
    milestone_10k_reward:    '500',
    comment_reward:          '1',
    min_trust_to_publish:    'TRUSTED',
    auto_moderation:         'true',
  },
};

@Injectable()
export class ModuleConfigService {
  // Simple in-process cache (TTL 5 min)
  private cache: Map<string, { value: string; expiresAt: number }> = new Map();
  private readonly TTL = 5 * 60 * 1000;

  constructor(private readonly prisma: PrismaService) {}

  async get(module: string, key: string): Promise<string> {
    const cacheKey = `${module}:${key}`;
    const hit = this.cache.get(cacheKey);
    if (hit && hit.expiresAt > Date.now()) return hit.value;

    const row = await this.prisma.moduleConfig.findUnique({
      where: { module_key: { module, key } },
    });
    const value = row?.value ?? DEFAULTS[module]?.[key] ?? '';
    this.cache.set(cacheKey, { value, expiresAt: Date.now() + this.TTL });
    return value;
  }

  async getNumber(module: string, key: string): Promise<number> {
    return parseFloat(await this.get(module, key));
  }

  async getBoolean(module: string, key: string): Promise<boolean> {
    return (await this.get(module, key)) === 'true';
  }

  async getJson<T>(module: string, key: string): Promise<T> {
    return JSON.parse(await this.get(module, key));
  }

  async set(module: string, key: string, value: string, updatedBy: string) {
    const cacheKey = `${module}:${key}`;
    this.cache.delete(cacheKey);
    return this.prisma.moduleConfig.upsert({
      where: { module_key: { module, key } },
      create: { module, key, value, updatedBy },
      update: { value, updatedBy },
    });
  }

  async listModule(module: string) {
    const rows = await this.prisma.moduleConfig.findMany({ where: { module } });
    const defaults = DEFAULTS[module] ?? {};
    const map: Record<string, { value: string; isDefault: boolean }> = {};
    for (const [k, v] of Object.entries(defaults)) {
      map[k] = { value: v, isDefault: true };
    }
    for (const row of rows) {
      map[row.key] = { value: row.value, isDefault: false };
    }
    return map;
  }

  /* ── ModuleRole helpers ── */

  async hasRole(module: string, gamadId: string, role: string): Promise<boolean> {
    const r = await this.prisma.moduleRole.findUnique({
      where: { module_gamadId_role: { module, gamadId, role } },
    });
    return !!r?.active;
  }

  async grantRole(module: string, gamadId: string, role: string, grantedBy: string) {
    return this.prisma.moduleRole.upsert({
      where: { module_gamadId_role: { module, gamadId, role } },
      create: { module, gamadId, role, grantedBy, active: true },
      update: { active: true, grantedBy },
    });
  }

  async revokeRole(module: string, gamadId: string, role: string) {
    return this.prisma.moduleRole.updateMany({
      where: { module, gamadId, role },
      data: { active: false },
    });
  }

  async listRoles(module: string) {
    return this.prisma.moduleRole.findMany({
      where: { module, active: true },
      include: {
        gamad: { select: { publicCode: true, profile: { select: { displayName: true, avatarUrl: true } } } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
