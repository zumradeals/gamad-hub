import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ZumaraType, ZumaraVisibility } from '@prisma/client';

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
        memberCount: true,
        cotisationAmount: true,
        cotisationPeriod: true,
        activatedAt: true,
        memberships: {
          where: { status: 'ACTIVE' },
          select: { role: true, joinedAt: true },
          take: 10,
        },
      },
    });
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

  findMyCells(gamadId: string) {
    return this.prisma.zumaraCellMembership.findMany({
      where: { gamadId, status: 'ACTIVE' },
      include: { cell: { select: { id: true, name: true, slug: true, status: true, type: true, country: true } } },
    });
  }
}
