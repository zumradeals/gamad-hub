import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class CotisationRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── Periods ───────────────────────────────────────────────────────────────

  findAllPeriods() {
    return this.prisma.cotisationPeriod.findMany({
      include: { _count: { select: { payments: true } } },
      orderBy: { startDate: 'desc' },
    });
  }

  findActivePeriod() {
    return this.prisma.cotisationPeriod.findFirst({
      where: { isActive: true },
      orderBy: { startDate: 'desc' },
    });
  }

  findPeriodById(id: string) {
    return this.prisma.cotisationPeriod.findUnique({
      where: { id },
      include: { _count: { select: { payments: true } } },
    });
  }

  createPeriod(data: {
    label: string;
    startDate: Date;
    endDate: Date;
    amount: number;
  }) {
    return this.prisma.cotisationPeriod.create({ data });
  }

  deactivatePeriod(id: string) {
    return this.prisma.cotisationPeriod.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ── Payments ──────────────────────────────────────────────────────────────

  findAllPayments(opts?: { gamadId?: string; periodId?: string; skip?: number; take?: number }) {
    const where: any = {};
    if (opts?.gamadId) where.gamadId = opts.gamadId;
    if (opts?.periodId) where.periodId = opts.periodId;
    return this.prisma.cotisationPayment.findMany({
      where,
      include: { period: { select: { id: true, label: true, startDate: true, endDate: true } } },
      orderBy: { paidAt: 'desc' },
      skip: opts?.skip ?? 0,
      take: opts?.take ?? 50,
    });
  }

  findPaymentById(id: string) {
    return this.prisma.cotisationPayment.findUnique({
      where: { id },
      include: { period: true },
    });
  }

  findPaymentByGamadAndPeriod(gamadId: string, periodId: string) {
    return this.prisma.cotisationPayment.findFirst({
      where: { gamadId, periodId },
    });
  }

  createPayment(data: {
    gamadId: string;
    periodId: string;
    amount: number;
    currency?: string;
    reference?: string;
  }) {
    return this.prisma.cotisationPayment.create({
      data: { ...data, currency: data.currency ?? 'XOF' },
      include: { period: { select: { id: true, label: true } } },
    });
  }
}
