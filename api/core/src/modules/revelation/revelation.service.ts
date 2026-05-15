import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { RevelationRepository } from './revelation.repository';
import { AuditService } from '../audit/audit.service';
import { GrantAccessDto } from './dto/grant-access.dto';
import { SponsorDto } from './dto/sponsor.dto';
import { RevelationPath, IdentityStatus } from '@prisma/client';

@Injectable()
export class RevelationService {
  constructor(
    private readonly repo: RevelationRepository,
    private readonly audit: AuditService,
  ) {}

  listEvents() {
    return this.repo.findAllEvents();
  }

  async grantAccess(actorId: string, dto: GrantAccessDto) {
    const target = await this.repo.findGamadById(dto.gamadId);
    if (!target) throw new NotFoundException('Citoyen introuvable');

    if (target.status === IdentityStatus.ACTIVE || target.status === IdentityStatus.ILLUMINATED) {
      throw new BadRequestException('Ce citoyen a déjà accès au Core');
    }

    await this.repo.updateGamadStatus(dto.gamadId, IdentityStatus.ACTIVE);

    const event = await this.repo.createEvent({
      gamadId: dto.gamadId,
      path: dto.path,
      actorId,
      note: dto.note,
    });

    await this.audit.createEvent({
      actorId,
      action: 'REVELATION_GRANTED',
      targetType: 'GamadId',
      targetId: dto.gamadId,
      newValue: { path: dto.path, eventId: event.id },
    });

    return event;
  }

  async sponsor(actorId: string, dto: SponsorDto) {
    const target = await this.repo.findGamadById(dto.gamadId);
    if (!target) throw new NotFoundException('Citoyen introuvable');

    if (target.status !== IdentityStatus.PORTAL_USER && target.status !== IdentityStatus.PENDING) {
      throw new BadRequestException('Ce citoyen ne peut pas être parrainé');
    }

    const event = await this.repo.createEvent({
      gamadId: dto.gamadId,
      path: RevelationPath.SPONSORED,
      actorId,
      note: dto.note,
    });

    await this.audit.createEvent({
      actorId,
      action: 'REVELATION_SPONSORED',
      targetType: 'GamadId',
      targetId: dto.gamadId,
      newValue: { sponsorId: actorId, eventId: event.id },
    });

    return event;
  }

  async getCandidates() {
    const candidates = await this.repo.findCandidates();
    return candidates.map((c) => ({
      gamadId: c.id,
      publicCode: c.publicCode,
      profile: c.profile,
      reputationScore: c.reputation?.score ?? 0,
      completedFormations: c.enrollments.length,
      zumaraLeaderMonths: c.zumaraCellMemberships.length,
    }));
  }
}
