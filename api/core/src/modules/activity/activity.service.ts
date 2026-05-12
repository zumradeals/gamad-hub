import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ActivityPriority, ActivityStatus } from "@prisma/client";
import { AuditService } from "../audit/audit.service";
import { PermissionsService } from "../permissions/permissions.service";
import { ActivityDecisionDto } from "./dto/activity-decision.dto";
import { CreateActivityDto } from "./dto/create-activity.dto";
import { CreateTaskDto } from "./dto/create-task.dto";
import { ReportDto } from "./dto/report.dto";
import { ActivityRepository } from "./activity.repository";

@Injectable()
export class ActivityService {
  constructor(
    private readonly activityRepository: ActivityRepository,
    private readonly permissionsService: PermissionsService,
    private readonly auditService: AuditService
  ) {}

  async listActivities(actorId: string | undefined, query?: { skip?: number; take?: number }) {
    await this.permissionsService.assertPermission({ actorId: actorId ?? "", permissionCode: "activity.read" });
    const skip = Math.max(query?.skip ?? 0, 0);
    const take = Math.min(Math.max(query?.take ?? 100, 1), 500);
    const [items, total] = await Promise.all([
      this.activityRepository.listActivities({ skip, take }),
      this.activityRepository.countActivities()
    ]);
    return { items, total, skip, take };
  }

  async createActivity(actorId: string | undefined, dto: CreateActivityDto) {
    await this.permissionsService.assertPermission({ actorId: actorId ?? "", permissionCode: "activity.create", organizationUnitId: dto.organizationUnitId });
    this.assertText(dto.title, "title");

    const activity = await this.activityRepository.createActivity({
      title: dto.title,
      description: dto.description,
      organizationUnitId: dto.organizationUnitId,
      ownerId: actorId ?? "",
      priority: this.toPriority(dto.priority ?? "normal"),
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined
    });

    await this.auditAndEmit(actorId, "ACTIVITY_CREATED", activity.id, activity.organizationUnitId, undefined, activity);
    return activity;
  }

  async readActivity(actorId: string | undefined, id: string) {
    const activity = await this.assertActivity(id);
    await this.permissionsService.assertPermission({ actorId: actorId ?? "", permissionCode: "activity.read", organizationUnitId: activity.organizationUnitId });
    return activity;
  }

  async submitActivity(actorId: string | undefined, id: string) {
    const activity = await this.transition(actorId, id, "activity.update", ["DRAFT"], ActivityStatus.SUBMITTED, "ACTIVITY_SUBMITTED");
    this.auditService.emitEvent("WORKFLOW_STARTED", { targetType: "activity", targetId: id }, { actorId, targetType: "ACTIVITY", targetId: id });
    return activity;
  }

  async validateActivity(actorId: string | undefined, id: string, dto: ActivityDecisionDto) {
    this.assertText(dto.decisionNote, "decisionNote");
    return this.transition(actorId, id, "activity.validate", ["SUBMITTED"], ActivityStatus.VALIDATED, "ACTIVITY_VALIDATED", dto);
  }

  async rejectActivity(actorId: string | undefined, id: string, dto: ActivityDecisionDto) {
    this.assertText(dto.decisionNote, "decisionNote");
    return this.transition(actorId, id, "activity.validate", ["SUBMITTED"], ActivityStatus.DRAFT, "ACTIVITY_REJECTED", dto);
  }

  async startActivity(actorId: string | undefined, id: string) {
    return this.transition(actorId, id, "activity.update", ["VALIDATED"], ActivityStatus.IN_PROGRESS, "ACTIVITY_STARTED");
  }

  async completeActivity(actorId: string | undefined, id: string) {
    return this.transition(actorId, id, "activity.update", ["IN_PROGRESS"], ActivityStatus.COMPLETED, "ACTIVITY_COMPLETED");
  }

  async archiveActivity(actorId: string | undefined, id: string, dto: ActivityDecisionDto) {
    this.assertText(dto.decisionNote, "decisionNote");
    return this.transition(actorId, id, "activity.archive", ["COMPLETED"], ActivityStatus.ARCHIVED, "ACTIVITY_ARCHIVED", dto);
  }

  async createTask(actorId: string | undefined, activityId: string, dto: CreateTaskDto) {
    const activity = await this.assertActivity(activityId);
    await this.permissionsService.assertPermission({ actorId: actorId ?? "", permissionCode: "task.create", organizationUnitId: activity.organizationUnitId });
    this.assertText(dto.title, "title");
    if (activity.status === "ARCHIVED") {
      throw new BadRequestException("Archived activity cannot receive tasks");
    }

    const task = await this.activityRepository.createTask({
      activityId,
      title: dto.title,
      description: dto.description,
      assignedTo: dto.assignedTo,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined
    });

    await this.auditAndEmit(actorId, "TASK_CREATED", task.id, activity.organizationUnitId, undefined, task);
    if (dto.assignedTo) {
      this.auditService.emitEvent("TASK_ASSIGNED", { taskId: task.id, assignedTo: dto.assignedTo }, { actorId, targetType: "TASK", targetId: task.id });
    }
    return task;
  }

  async completeTask(actorId: string | undefined, taskId: string) {
    const task = await this.activityRepository.findTask(taskId);
    if (!task) {
      throw new NotFoundException("Task not found");
    }
    await this.permissionsService.assertPermission({ actorId: actorId ?? "", permissionCode: "task.update", organizationUnitId: task.activity.organizationUnitId });
    const updated = await this.activityRepository.completeTask(taskId);
    await this.auditAndEmit(actorId, "TASK_COMPLETED", taskId, task.activity.organizationUnitId, { status: task.status }, updated);
    return updated;
  }

  async submitReport(actorId: string | undefined, activityId: string, dto: ReportDto) {
    const activity = await this.assertActivity(activityId);
    await this.permissionsService.assertPermission({ actorId: actorId ?? "", permissionCode: "activity.update", organizationUnitId: activity.organizationUnitId });
    this.assertText(dto.summary, "summary");
    await this.auditAndEmit(actorId, "REPORT_SUBMITTED", activityId, activity.organizationUnitId, undefined, { summary: dto.summary });
    return { activityId, summary: dto.summary, submittedAt: new Date().toISOString() };
  }

  private async transition(
    actorId: string | undefined,
    id: string,
    permissionCode: string,
    allowedFrom: string[],
    nextStatus: ActivityStatus,
    eventName: string,
    note?: unknown
  ) {
    const before = await this.assertActivity(id);
    await this.permissionsService.assertPermission({ actorId: actorId ?? "", permissionCode, organizationUnitId: before.organizationUnitId });
    if (!allowedFrom.includes(before.status)) {
      throw new BadRequestException(`Invalid transition from ${before.status} to ${nextStatus}`);
    }
    const updated = await this.activityRepository.updateActivityStatus(id, nextStatus);
    await this.auditAndEmit(actorId, eventName, id, before.organizationUnitId, { status: before.status }, { status: updated.status, note });
    return updated;
  }

  private async assertActivity(id: string) {
    const activity = await this.activityRepository.findActivity(id);
    if (!activity) {
      throw new NotFoundException("Activity not found");
    }
    return activity;
  }

  private async auditAndEmit(actorId: string | undefined, action: string, targetId: string, organizationUnitId: string, oldValue?: unknown, newValue?: unknown) {
    await this.auditService.writeAudit({
      actorId,
      action,
      targetType: action.startsWith("TASK") ? "TASK" : "ACTIVITY",
      targetId,
      organizationUnitId,
      oldValue,
      newValue
    });
    this.auditService.emitEvent(action, newValue, { actorId, targetType: action.startsWith("TASK") ? "TASK" : "ACTIVITY", targetId, organizationUnitId });
  }

  private assertText(value: string | undefined, field: string) {
    if (!value?.trim()) {
      throw new BadRequestException(`${field} is required`);
    }
  }

  private toPriority(value: string) {
    const normalized = value.toUpperCase();
    if (!["LOW", "NORMAL", "HIGH", "STRATEGIC"].includes(normalized)) {
      throw new BadRequestException("invalid priority");
    }
    return normalized as ActivityPriority;
  }
}
