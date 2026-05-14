import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CotisationRepository } from './cotisation.repository';
import { AuditService } from '../audit/audit.service';
import { CreatePeriodDto } from './dto/create-period.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';

@Injectable()
export class CotisationService {
  constructor(
    private readonly repo: CotisationRepository,
    private readonly audit: AuditService,
  ) {}

  // ── Periods ───────────────────────────────────────────────────────────────

  findAllPeriods() {
    return this.repo.findAllPeriods();
  }

  async findPeriodById(id: string) {
    const period = await this.repo.findPeriodById(id);
    if (!period) throw new NotFoundException('Period not found');
    return period;
  }

  async createPeriod(actorId: string, dto: CreatePeriodDto) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (end <= start) throw new BadRequestException('endDate must be after startDate');

    const period = await this.repo.createPeriod({
      label: dto.label,
      startDate: start,
      endDate: end,
      amount: dto.amount,
    });
    await this.audit.createEvent({
      actorId,
      action: 'COTISATION_PERIOD_CREATED',
      targetType: 'CotisationPeriod',
      targetId: period.id,
      metadata: { label: period.label, amount: period.amount },
    });
    return period;
  }

  async deactivatePeriod(actorId: string, id: string) {
    const period = await this.repo.findPeriodById(id);
    if (!period) throw new NotFoundException('Period not found');
    const updated = await this.repo.deactivatePeriod(id);
    await this.audit.createEvent({
      actorId,
      action: 'COTISATION_PERIOD_DEACTIVATED',
      targetType: 'CotisationPeriod',
      targetId: id,
    });
    return updated;
  }

  // ── Payments ──────────────────────────────────────────────────────────────

  findAllPayments(opts?: { gamadId?: string; periodId?: string; skip?: number; take?: number }) {
    return this.repo.findAllPayments(opts);
  }

  findMyPayments(actorId: string) {
    return this.repo.findAllPayments({ gamadId: actorId });
  }

  async getMyStatus(actorId: string) {
    const activePeriod = await this.repo.findActivePeriod();
    if (!activePeriod) return { upToDate: false, activePeriod: null, payment: null };

    const payment = await this.repo.findPaymentByGamadAndPeriod(actorId, activePeriod.id);
    return {
      upToDate: !!payment,
      activePeriod,
      payment: payment ?? null,
    };
  }

  async recordPayment(actorId: string, dto: RecordPaymentDto) {
    // actorId is the recorder; gamadId is the member being paid for (defaults to actor)
    const targetGamadId = dto.gamadId ?? actorId;

    const period = await this.repo.findPeriodById(dto.periodId);
    if (!period) throw new NotFoundException('Period not found');
    if (!period.isActive) throw new BadRequestException('Cannot record payment for an inactive period');

    const existing = await this.repo.findPaymentByGamadAndPeriod(targetGamadId, dto.periodId);
    if (existing) {
      throw new ConflictException('Payment already recorded for this member and period');
    }

    const payment = await this.repo.createPayment({
      gamadId: targetGamadId,
      periodId: dto.periodId,
      amount: dto.amount,
      currency: dto.currency,
      reference: dto.reference,
    });
    await this.audit.createEvent({
      actorId,
      action: 'COTISATION_PAYMENT_RECORDED',
      targetType: 'CotisationPayment',
      targetId: payment.id,
      metadata: { gamadId: targetGamadId, periodId: dto.periodId, amount: dto.amount },
    });
    return payment;
  }
}
