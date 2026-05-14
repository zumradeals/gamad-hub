import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ActivityStatus, ActivityPriority, TaskStatus } from '@prisma/client';

const ACTIVITY_INCLUDE = {
  owner: { include: { profile: { select: { displayName: true, avatarUrl: true } } } },
  organizationUnit: { select: { id: true, name: true } },
  tasks: {
    include: {
      assignee: { include: { profile: { select: { displayName: true } } } },
    },
    orderBy: { createdAt: 'asc' as const },
  },
  reports: {
    include: {
      author: { include: { profile: { select: { displayName: true } } } },
    },
    orderBy: { createdAt: 'desc' as const },
  },
  _count: { select: { tasks: true, reports: true } },
};

@Injectable()
export class ActivityRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── Activities ────────────────────────────────────────────────────────────

  findAll(opts?: {
    unitId?: string;
    status?: string;
    ownerId?: string;
    skip?: number;
    take?: number;
  }) {
    const where: any = {};
    if (opts?.unitId) where.organizationUnitId = opts.unitId;
    if (opts?.status) where.status = opts.status as ActivityStatus;
    if (opts?.ownerId) where.ownerId = opts.ownerId;
    return this.prisma.activity.findMany({
      where,
      include: {
        owner: { include: { profile: { select: { displayName: true } } } },
        organizationUnit: { select: { id: true, name: true } },
        _count: { select: { tasks: true } },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      skip: opts?.skip ?? 0,
      take: opts?.take ?? 30,
    });
  }

  findById(id: string) {
    return this.prisma.activity.findUnique({ where: { id }, include: ACTIVITY_INCLUDE });
  }

  create(data: {
    title: string;
    description?: string;
    organizationUnitId?: string;
    ownerId: string;
    priority?: ActivityPriority;
    startDate?: Date;
    endDate?: Date;
  }) {
    return this.prisma.activity.create({ data, include: ACTIVITY_INCLUDE });
  }

  update(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      priority: ActivityPriority;
      startDate: Date;
      endDate: Date;
    }>,
  ) {
    return this.prisma.activity.update({ where: { id }, data, include: ACTIVITY_INCLUDE });
  }

  updateStatus(id: string, status: ActivityStatus) {
    return this.prisma.activity.update({ where: { id }, data: { status }, include: ACTIVITY_INCLUDE });
  }

  // ── Tasks ─────────────────────────────────────────────────────────────────

  findTaskById(id: string) {
    return this.prisma.task.findUnique({
      where: { id },
      include: {
        activity: { select: { id: true, title: true, ownerId: true } },
        assignee: { include: { profile: { select: { displayName: true } } } },
      },
    });
  }

  createTask(data: {
    activityId: string;
    title: string;
    description?: string;
    assignedTo?: string;
    dueDate?: Date;
  }) {
    return this.prisma.task.create({
      data,
      include: {
        assignee: { include: { profile: { select: { displayName: true } } } },
      },
    });
  }

  updateTaskStatus(id: string, status: TaskStatus) {
    return this.prisma.task.update({
      where: { id },
      data: { status },
      include: {
        assignee: { include: { profile: { select: { displayName: true } } } },
      },
    });
  }

  // ── Reports ───────────────────────────────────────────────────────────────

  createReport(data: { activityId: string; authorId: string; content: string }) {
    return this.prisma.activityReport.create({
      data,
      include: {
        author: { include: { profile: { select: { displayName: true } } } },
      },
    });
  }
}
