import { Injectable } from "@nestjs/common";
import { ActivityPriority, ActivityStatus, TaskStatus } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class ActivityRepository {
  constructor(private readonly prisma: PrismaService) {}

  listActivities(params: { skip: number; take: number }) {
    return this.prisma.activity.findMany({
      skip: params.skip,
      take: params.take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        createdAt: true,
        owner: { select: { profile: { select: { displayName: true } } } },
        organizationUnit: { select: { id: true, name: true } },
        _count: { select: { tasks: true } }
      }
    });
  }

  countActivities() {
    return this.prisma.activity.count();
  }

  createActivity(data: {
    title: string;
    description?: string;
    organizationUnitId: string;
    ownerId: string;
    priority: ActivityPriority;
    startDate?: Date;
    endDate?: Date;
  }) {
    return this.prisma.activity.create({ data });
  }

  findActivity(id: string) {
    return this.prisma.activity.findUnique({
      where: { id },
      include: {
        organizationUnit: true,
        owner: { include: { profile: true } },
        tasks: true
      }
    });
  }

  updateActivityStatus(id: string, status: ActivityStatus) {
    return this.prisma.activity.update({
      where: { id },
      data: { status }
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
      data: {
        ...data,
        status: TaskStatus.TODO
      }
    });
  }

  findTask(id: string) {
    return this.prisma.task.findUnique({
      where: { id },
      include: { activity: true, assignee: true }
    });
  }

  completeTask(id: string) {
    return this.prisma.task.update({
      where: { id },
      data: { status: TaskStatus.DONE }
    });
  }
}
