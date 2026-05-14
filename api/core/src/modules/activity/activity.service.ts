import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ActivityStatus, ActivityPriority, TaskStatus } from '@prisma/client';
import { ActivityRepository } from './activity.repository';
import { AuditService } from '../audit/audit.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { RejectActivityDto } from './dto/reject-activity.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { CreateReportDto } from './dto/create-report.dto';

const ALLOWED_TRANSITIONS: Record<ActivityStatus, ActivityStatus[]> = {
  DRAFT: [ActivityStatus.SUBMITTED],
  SUBMITTED: [ActivityStatus.VALIDATED, ActivityStatus.DRAFT],
  VALIDATED: [ActivityStatus.IN_PROGRESS],
  IN_PROGRESS: [ActivityStatus.COMPLETED],
  COMPLETED: [ActivityStatus.ARCHIVED],
  ARCHIVED: [],
};

@Injectable()
export class ActivityService {
  constructor(
    private readonly repo: ActivityRepository,
    private readonly audit: AuditService,
  ) {}

  // ── Activities ────────────────────────────────────────────────────────────

  findAll(opts?: { unitId?: string; status?: string; ownerId?: string; skip?: number; take?: number }) {
    return this.repo.findAll(opts);
  }

  async findById(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Activity not found');
    return item;
  }

  async create(actorId: string, dto: CreateActivityDto) {
    const activity = await this.repo.create({
      title: dto.title,
      description: dto.description,
      organizationUnitId: dto.organizationUnitId,
      ownerId: actorId,
      priority: (dto.priority as ActivityPriority) ?? ActivityPriority.NORMAL,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    });
    await this.audit.createEvent({
      actorId,
      action: 'ACTIVITY_CREATED',
      targetType: 'Activity',
      targetId: activity.id,
      metadata: { title: activity.title, priority: activity.priority },
    });
    return activity;
  }

  async update(actorId: string, id: string, dto: UpdateActivityDto) {
    const activity = await this.repo.findById(id);
    if (!activity) throw new NotFoundException('Activity not found');
    if (activity.ownerId !== actorId) throw new ForbiddenException('Only the owner can edit this activity');
    if (activity.status === ActivityStatus.ARCHIVED) {
      throw new ForbiddenException('Cannot edit an archived activity');
    }
    return this.repo.update(id, {
      title: dto.title,
      description: dto.description,
      priority: dto.priority as ActivityPriority | undefined,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    });
  }

  private async transition(actorId: string, id: string, target: ActivityStatus, action: string, meta?: object) {
    const activity = await this.repo.findById(id);
    if (!activity) throw new NotFoundException('Activity not found');
    const allowed = ALLOWED_TRANSITIONS[activity.status];
    if (!allowed.includes(target)) {
      throw new BadRequestException(
        `Cannot transition from ${activity.status} to ${target}`,
      );
    }
    const updated = await this.repo.updateStatus(id, target);
    await this.audit.createEvent({
      actorId,
      action,
      targetType: 'Activity',
      targetId: id,
      metadata: { from: activity.status, to: target, ...meta },
    });
    return updated;
  }

  submit(actorId: string, id: string) {
    return this.transition(actorId, id, ActivityStatus.SUBMITTED, 'ACTIVITY_SUBMITTED');
  }

  validate(actorId: string, id: string) {
    return this.transition(actorId, id, ActivityStatus.VALIDATED, 'ACTIVITY_VALIDATED');
  }

  async reject(actorId: string, id: string, dto: RejectActivityDto) {
    const activity = await this.repo.findById(id);
    if (!activity) throw new NotFoundException('Activity not found');
    if (activity.status !== ActivityStatus.SUBMITTED) {
      throw new BadRequestException('Only SUBMITTED activities can be rejected');
    }
    const updated = await this.repo.updateStatus(id, ActivityStatus.DRAFT);
    await this.audit.createEvent({
      actorId,
      action: 'ACTIVITY_REJECTED',
      targetType: 'Activity',
      targetId: id,
      metadata: { reason: dto.reason },
    });
    return updated;
  }

  start(actorId: string, id: string) {
    return this.transition(actorId, id, ActivityStatus.IN_PROGRESS, 'ACTIVITY_STARTED');
  }

  complete(actorId: string, id: string) {
    return this.transition(actorId, id, ActivityStatus.COMPLETED, 'ACTIVITY_COMPLETED');
  }

  archive(actorId: string, id: string) {
    return this.transition(actorId, id, ActivityStatus.ARCHIVED, 'ACTIVITY_ARCHIVED');
  }

  // ── Tasks ─────────────────────────────────────────────────────────────────

  async createTask(actorId: string, activityId: string, dto: CreateTaskDto) {
    const activity = await this.repo.findById(activityId);
    if (!activity) throw new NotFoundException('Activity not found');
    if (activity.status === ActivityStatus.ARCHIVED || activity.status === ActivityStatus.COMPLETED) {
      throw new ForbiddenException('Cannot add tasks to a completed or archived activity');
    }
    const task = await this.repo.createTask({
      activityId,
      title: dto.title,
      description: dto.description,
      assignedTo: dto.assignedTo,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    });
    await this.audit.createEvent({
      actorId,
      action: 'TASK_CREATED',
      targetType: 'Task',
      targetId: task.id,
      metadata: { activityId, assignedTo: dto.assignedTo },
    });
    if (dto.assignedTo) {
      await this.audit.createEvent({
        actorId,
        action: 'TASK_ASSIGNED',
        targetType: 'Task',
        targetId: task.id,
        metadata: { assignedTo: dto.assignedTo },
      });
    }
    return task;
  }

  async completeTask(actorId: string, taskId: string) {
    const task = await this.repo.findTaskById(taskId);
    if (!task) throw new NotFoundException('Task not found');
    if (task.status === TaskStatus.DONE) throw new BadRequestException('Task already completed');
    const updated = await this.repo.updateTaskStatus(taskId, TaskStatus.DONE);
    await this.audit.createEvent({
      actorId,
      action: 'TASK_COMPLETED',
      targetType: 'Task',
      targetId: taskId,
      metadata: { activityId: task.activityId },
    });
    return updated;
  }

  // ── Reports ───────────────────────────────────────────────────────────────

  async createReport(actorId: string, activityId: string, dto: CreateReportDto) {
    const activity = await this.repo.findById(activityId);
    if (!activity) throw new NotFoundException('Activity not found');
    return this.repo.createReport({ activityId, authorId: actorId, content: dto.content });
  }
}
