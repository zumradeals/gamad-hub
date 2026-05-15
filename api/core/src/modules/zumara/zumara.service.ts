import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ZumaraRepository } from './zumara.repository';
import { AuditService } from '../audit/audit.service';
import { PreValidateDto } from './dto/pre-validate.dto';
import { RejectRequestDto } from './dto/reject-request.dto';
import { UpdateZumaraCellDto } from './dto/update-zumara.dto';
import { SuspendZumaraDto } from './dto/suspend-zumara.dto';
import { ZumaraRequestStatus, ZumaraStatus, ZumaraVisibility } from '@prisma/client';

@Injectable()
export class ZumaraService {
  constructor(
    private readonly repo: ZumaraRepository,
    private readonly audit: AuditService,
  ) {}

  listRequests(status?: ZumaraRequestStatus, country?: string) {
    return this.repo.findAllRequests({ status, country });
  }

  async getRequest(id: string) {
    const req = await this.repo.findRequestById(id);
    if (!req) throw new NotFoundException('Demande introuvable');
    return req;
  }

  async preValidate(id: string, actorId: string, dto: PreValidateDto) {
    const req = await this.getRequest(id);
    if (req.status !== 'SUBMITTED') {
      throw new BadRequestException('Seules les demandes SUBMITTED peuvent être pré-validées');
    }
    const days = dto.deadlineDays ?? 30;
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + days);

    const updated = await this.repo.updateRequestStatus(id, {
      status: ZumaraRequestStatus.PRE_VALIDATED,
      reviewedBy: actorId,
      reviewedAt: new Date(),
      deadline,
    });

    await this.audit.createEvent({
      actorId,
      action: 'ZUMARA_REQUEST_PRE_VALIDATED',
      targetType: 'ZumaraRequest',
      targetId: id,
      newValue: { deadlineDays: days, deadline },
    });

    return updated;
  }

  async reject(id: string, actorId: string, dto: RejectRequestDto) {
    const req = await this.getRequest(id);
    if (req.status === ZumaraRequestStatus.ACTIVE || req.status === ZumaraRequestStatus.REJECTED) {
      throw new BadRequestException('Cette demande ne peut pas être rejetée');
    }

    const updated = await this.repo.updateRequestStatus(id, {
      status: ZumaraRequestStatus.REJECTED,
      reviewNote: dto.reason,
      reviewedBy: actorId,
      reviewedAt: new Date(),
    });

    await this.audit.createEvent({
      actorId,
      action: 'ZUMARA_REQUEST_REJECTED',
      targetType: 'ZumaraRequest',
      targetId: id,
      newValue: { reason: dto.reason },
    });

    return updated;
  }

  async activate(id: string, actorId: string) {
    const req = await this.getRequest(id);
    if (req.status !== ZumaraRequestStatus.IN_FORMATION) {
      throw new BadRequestException('La demande doit être en statut IN_FORMATION pour être activée');
    }

    const trainedFounders = req.founders.filter((f) => f.trained);
    if (trainedFounders.length < 5) {
      throw new BadRequestException(`Seulement ${trainedFounders.length}/5 dirigeants ont complété la formation`);
    }

    await this.repo.updateRequestStatus(id, {
      status: ZumaraRequestStatus.ACTIVE,
      activatedAt: new Date(),
    });

    const slug = req.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const cell = await this.repo.createCell({
      requestId: id,
      name: req.name,
      slug: `${slug}-${Date.now()}`,
      objective: req.objective,
      type: req.type,
      country: req.country ?? undefined,
      city: req.city ?? undefined,
    });

    await this.audit.createEvent({
      actorId,
      action: 'ZUMARA_ACTIVATED',
      targetType: 'ZumaraCell',
      targetId: cell.id,
      newValue: { requestId: id },
    });

    return cell;
  }

  listCells(status?: ZumaraStatus) {
    return this.repo.findAllCells({ status });
  }

  async getCell(id: string) {
    const cell = await this.repo.findCellById(id);
    if (!cell) throw new NotFoundException('Zumara introuvable');
    return cell;
  }

  async updateCell(id: string, actorId: string, dto: UpdateZumaraCellDto) {
    await this.getCell(id);
    const updated = await this.repo.updateCell(id, dto);
    await this.audit.createEvent({
      actorId,
      action: 'ZUMARA_UPDATED',
      targetType: 'ZumaraCell',
      targetId: id,
      newValue: dto as any,
    });
    return updated;
  }

  async suspend(id: string, actorId: string, dto: SuspendZumaraDto) {
    await this.getCell(id);
    const updated = await this.repo.updateCell(id, { status: ZumaraStatus.SUSPENDED });
    await this.audit.createEvent({
      actorId,
      action: 'ZUMARA_SUSPENDED',
      targetType: 'ZumaraCell',
      targetId: id,
      newValue: { reason: dto.reason },
    });
    return updated;
  }

  async promoteElite(id: string, actorId: string) {
    await this.getCell(id);
    const updated = await this.repo.updateCell(id, {
      status: ZumaraStatus.ELITE,
      visibility: ZumaraVisibility.CORE,
    });
    await this.audit.createEvent({
      actorId,
      action: 'ZUMARA_PROMOTED_ELITE',
      targetType: 'ZumaraCell',
      targetId: id,
      newValue: { status: 'ELITE', visibility: 'CORE' },
    });
    return updated;
  }
}
