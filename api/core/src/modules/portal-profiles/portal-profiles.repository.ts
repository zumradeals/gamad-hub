import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class PortalProfilesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPublicProfile(publicCode: string) {
    const gamad = await this.prisma.gamadId.findUnique({
      where: { publicCode },
      include: {
        profile: true,
        reputation: true,
        enrollments: { where: { status: 'COMPLETED' }, include: { formation: { select: { title: true } } } },
        zumaraCellMemberships: {
          where: { status: 'ACTIVE' },
          include: { cell: { select: { name: true, slug: true, type: true, status: true, visibility: true } } },
        },
        feedPosts: {
          where: { status: 'PUBLISHED', moderationStatus: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { id: true, content: true, createdAt: true },
        },
      },
    });
    if (!gamad || !['PORTAL_USER', 'PENDING', 'ACTIVE', 'MISSIONARY', 'ILLUMINATED'].includes(gamad.status)) return null;
    return {
      publicCode: gamad.publicCode,
      displayName: gamad.profile?.displayName ?? 'Citoyen GAMAD',
      bio: gamad.profile?.bio ?? null,
      country: gamad.profile?.country ?? null,
      city: gamad.profile?.city ?? null,
      trustLevel: gamad.reputation?.trustLevel ?? 'NEWCOMER',
      reputationScore: gamad.reputation?.score ?? 0,
      completedFormations: gamad.enrollments.length,
      formations: gamad.enrollments.slice(0, 5).map(e => e.formation.title),
      zumara: gamad.zumaraCellMemberships
        .filter(m => m.cell.visibility === 'PUBLIC' || m.cell.visibility === 'INTERNAL')
        .map(m => ({ name: m.cell.name, slug: m.cell.slug, type: m.cell.type, role: m.role })),
      recentPosts: gamad.feedPosts,
      memberSince: gamad.createdAt,
    };
  }

  async findDirectory(filters: { country?: string; trustLevel?: string; skip: number; take: number }) {
    const gamads = await this.prisma.gamadId.findMany({
      where: {
        status: { in: ['PORTAL_USER', 'PENDING', 'ACTIVE', 'MISSIONARY', 'ILLUMINATED'] },
        profile: {
          visibility: { in: ['PUBLIC', 'INTERNAL'] },
          ...(filters.country ? { country: filters.country } : {}),
        },
        ...(filters.trustLevel ? { reputation: { trustLevel: filters.trustLevel as any } } : {}),
      },
      include: {
        profile: { select: { displayName: true, bio: true, country: true, city: true, avatarUrl: true } },
        reputation: { select: { trustLevel: true, score: true } },
        zumaraCellMemberships: {
          where: { status: 'ACTIVE' },
          select: { cell: { select: { name: true, slug: true } } },
          take: 2,
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: filters.skip,
      take: filters.take,
    });

    return gamads
      .filter(g => g.profile?.displayName)
      .map(g => ({
        publicCode: g.publicCode,
        displayName: g.profile!.displayName!,
        bio: g.profile?.bio ?? null,
        country: g.profile?.country ?? null,
        city: g.profile?.city ?? null,
        trustLevel: g.reputation?.trustLevel ?? 'NEWCOMER',
        reputationScore: g.reputation?.score ?? 0,
        zumara: g.zumaraCellMemberships.map(m => ({ name: m.cell.name, slug: m.cell.slug })),
      }));
  }
}
