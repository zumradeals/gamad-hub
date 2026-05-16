import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ZumaraType, ZumaraVisibility } from '@prisma/client';

const MEMBER_PROFILE = {
  gamad: {
    select: {
      publicCode: true,
      profile: { select: { displayName: true, avatarUrl: true } },
    },
  },
};

@Injectable()
export class PortalZumaraRepository {
  constructor(private readonly prisma: PrismaService) {}

  findPublicCells(filters: { type?: ZumaraType; country?: string; city?: string }) {
    return this.prisma.zumaraCell.findMany({
      where: {
        visibility: ZumaraVisibility.PUBLIC,
        ...(filters.type && { type: filters.type }),
        ...(filters.country && { country: filters.country }),
        ...(filters.city && { city: filters.city }),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        objective: true,
        type: true,
        country: true,
        city: true,
        status: true,
        memberCount: true,
        cotisationAmount: true,
        cotisationPeriod: true,
        createdAt: true,
      },
      orderBy: { memberCount: 'desc' },
    });
  }

  findCellBySlug(slug: string) {
    return this.prisma.zumaraCell.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        objective: true,
        type: true,
        country: true,
        city: true,
        status: true,
        visibility: true,
        memberCount: true,
        cotisationAmount: true,
        cotisationPeriod: true,
        walletBalance: true,
        activatedAt: true,
        createdAt: true,
        memberships: {
          where: { status: 'ACTIVE' },
          select: {
            role: true,
            joinedAt: true,
            ...MEMBER_PROFILE,
          },
          take: 6,
          orderBy: { joinedAt: 'asc' },
        },
        _count: { select: { memberships: true } },
      },
    });
  }

  findMembers(cellId: string, skip: number, take: number) {
    return this.prisma.zumaraCellMembership.findMany({
      where: { cellId, status: 'ACTIVE' },
      select: {
        role: true,
        joinedAt: true,
        ...MEMBER_PROFILE,
      },
      orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
      skip,
      take,
    });
  }

  countMembers(cellId: string) {
    return this.prisma.zumaraCellMembership.count({ where: { cellId, status: 'ACTIVE' } });
  }

  findSuggestions(country: string) {
    return this.prisma.zumaraCell.findMany({
      where: {
        visibility: ZumaraVisibility.PUBLIC,
        status: { in: ['ACTIVE', 'ESTABLISHED'] },
        country,
      },
      select: { id: true, name: true, slug: true, objective: true, type: true, city: true, memberCount: true },
      orderBy: { memberCount: 'asc' },
      take: 10,
    });
  }

  createRequest(data: { gamadId: string; name: string; objective: string; type: ZumaraType; country: string; city?: string }) {
    return this.prisma.zumaraRequest.create({ data });
  }

  findMyRequests(gamadId: string) {
    return this.prisma.zumaraRequest.findMany({
      where: { gamadId },
      include: { founders: true, cell: { select: { id: true, slug: true, status: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findRequestById(id: string) {
    return this.prisma.zumaraRequest.findUnique({
      where: { id },
      include: { founders: true, cell: { select: { id: true, slug: true, status: true } } },
    });
  }

  createMembership(cellId: string, gamadId: string) {
    return this.prisma.zumaraCellMembership.create({
      data: { cellId, gamadId, role: 'MEMBER', status: 'ACTIVE' },
    });
  }

  findMembership(cellId: string, gamadId: string) {
    return this.prisma.zumaraCellMembership.findUnique({
      where: { cellId_gamadId: { cellId, gamadId } },
    });
  }

  async deleteMembership(cellId: string, gamadId: string) {
    const m = await this.findMembership(cellId, gamadId);
    if (!m) return null;
    return this.prisma.zumaraCellMembership.delete({
      where: { cellId_gamadId: { cellId, gamadId } },
    });
  }

  findMyCells(gamadId: string) {
    return this.prisma.zumaraCellMembership.findMany({
      where: { gamadId, status: 'ACTIVE' },
      include: { cell: { select: { id: true, name: true, slug: true, status: true, type: true, country: true, memberCount: true } } },
    });
  }
}
