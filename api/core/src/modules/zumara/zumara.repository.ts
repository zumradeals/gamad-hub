import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ZumaraRequestStatus, ZumaraStatus, ZumaraVisibility } from '@prisma/client';

@Injectable()
export class ZumaraRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllRequests(filters: { status?: ZumaraRequestStatus; country?: string }) {
    return this.prisma.zumaraRequest.findMany({
      where: {
        ...(filters.status && { status: filters.status }),
        ...(filters.country && { country: filters.country }),
      },
      include: { gamad: { include: { profile: true, account: true } }, founders: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findRequestById(id: string) {
    return this.prisma.zumaraRequest.findUnique({
      where: { id },
      include: { gamad: { include: { profile: true, account: true } }, founders: true, cell: true },
    });
  }

  updateRequestStatus(
    id: string,
    data: { status: ZumaraRequestStatus; reviewNote?: string; reviewedBy?: string; reviewedAt?: Date; deadline?: Date; activatedAt?: Date },
  ) {
    return this.prisma.zumaraRequest.update({ where: { id }, data });
  }

  findAllCells(filters: { status?: ZumaraStatus; visibility?: ZumaraVisibility }) {
    return this.prisma.zumaraCell.findMany({
      where: {
        ...(filters.status && { status: filters.status }),
        ...(filters.visibility && { visibility: filters.visibility }),
      },
      include: { memberships: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findCellById(id: string) {
    return this.prisma.zumaraCell.findUnique({
      where: { id },
      include: { memberships: { include: { gamad: { include: { profile: true } } } }, request: true },
    });
  }

  updateCell(id: string, data: Partial<{ status: ZumaraStatus; visibility: ZumaraVisibility; cotisationAmount: number; cotisationPeriod: string }>) {
    return this.prisma.zumaraCell.update({ where: { id }, data });
  }

  createCell(data: {
    requestId: string;
    name: string;
    slug: string;
    objective: string;
    type: string;
    country?: string;
    city?: string;
  }) {
    return this.prisma.zumaraCell.create({ data: data as any });
  }
}
