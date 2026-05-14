import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(opts?: { actorId?: string; targetType?: string; skip?: number; take?: number }) {
    const where: any = {};
    if (opts?.actorId) where.actorId = opts.actorId;
    if (opts?.targetType) where.targetType = opts.targetType;
    return this.prisma.auditEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: opts?.skip ?? 0,
      take: opts?.take ?? 50,
    });
  }

  findById(id: string) {
    return this.prisma.auditEvent.findUnique({ where: { id } });
  }

  create(data: {
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
    return this.prisma.auditEvent.create({ data });
  }
}
