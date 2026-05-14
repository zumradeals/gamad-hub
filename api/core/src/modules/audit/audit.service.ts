import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditRepository } from './audit.repository';

@Injectable()
export class AuditService {
  constructor(private readonly repo: AuditRepository) {}

  findAll(opts?: { actorId?: string; targetType?: string; skip?: number; take?: number }) {
    return this.repo.findAll(opts);
  }

  async findById(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Audit event introuvable');
    return item;
  }

  createEvent(data: {
    actorId?: string;
    action: string;
    targetType: string;
    targetId?: string;
    organizationUnitId?: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.repo.create(data);
  }
}
