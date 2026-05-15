import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { RevelationPath, IdentityStatus } from '@prisma/client';

@Injectable()
export class RevelationRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllEvents() {
    return this.prisma.revelationEvent.findMany({
      include: { gamad: { include: { profile: true } } },
      orderBy: { grantedAt: 'desc' },
    });
  }

  createEvent(data: { gamadId: string; path: RevelationPath; actorId?: string; note?: string }) {
    return this.prisma.revelationEvent.create({ data });
  }

  updateGamadStatus(gamadId: string, status: IdentityStatus) {
    return this.prisma.gamadId.update({ where: { id: gamadId }, data: { status } });
  }

  findGamadById(gamadId: string) {
    return this.prisma.gamadId.findUnique({
      where: { id: gamadId },
      include: { profile: true, account: true, reputation: true, enrollments: true, zumaraCellMemberships: true },
    });
  }

  findCandidates() {
    return this.prisma.gamadId.findMany({
      where: { status: 'PORTAL_USER' },
      include: {
        profile: true,
        reputation: true,
        enrollments: { where: { status: 'COMPLETED' } },
        zumaraCellMemberships: { where: { role: { in: ['FOUNDER', 'CO_FOUNDER'] }, status: 'ACTIVE' } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
