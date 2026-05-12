import { Body, Controller, Get, Headers, Param, Post, Query } from "@nestjs/common";
import { ok } from "../../common/api-response";
import { ActivityDecisionDto } from "./dto/activity-decision.dto";
import { CreateActivityDto } from "./dto/create-activity.dto";
import { CreateTaskDto } from "./dto/create-task.dto";
import { ReportDto } from "./dto/report.dto";
import { ActivityService } from "./activity.service";

@Controller("activities")
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  async createActivity(@Headers("x-gamad-actor-id") actorId: string | undefined, @Body() dto: CreateActivityDto) {
    return ok(await this.activityService.createActivity(actorId, dto), { events: ["ACTIVITY_CREATED"] });
  }

  @Get()
  async listActivities(
    @Headers("x-gamad-actor-id") actorId: string | undefined,
    @Query("skip") skipRaw?: string,
    @Query("take") takeRaw?: string
  ) {
    return ok(await this.activityService.listActivities(actorId, { skip: skipRaw ? Number(skipRaw) : undefined, take: takeRaw ? Number(takeRaw) : undefined }));
  }

  @Get(":id")
  async readActivity(@Headers("x-gamad-actor-id") actorId: string | undefined, @Param("id") id: string) {
    return ok(await this.activityService.readActivity(actorId, id));
  }

  @Post(":id/submit")
  async submitActivity(@Headers("x-gamad-actor-id") actorId: string | undefined, @Param("id") id: string) {
    return ok(await this.activityService.submitActivity(actorId, id), { events: ["ACTIVITY_SUBMITTED", "WORKFLOW_STARTED"] });
  }

  @Post(":id/validate")
  async validateActivity(@Headers("x-gamad-actor-id") actorId: string | undefined, @Param("id") id: string, @Body() dto: ActivityDecisionDto) {
    return ok(await this.activityService.validateActivity(actorId, id, dto), { events: ["ACTIVITY_VALIDATED"] });
  }

  @Post(":id/reject")
  async rejectActivity(@Headers("x-gamad-actor-id") actorId: string | undefined, @Param("id") id: string, @Body() dto: ActivityDecisionDto) {
    return ok(await this.activityService.rejectActivity(actorId, id, dto), { events: ["ACTIVITY_REJECTED"] });
  }

  @Post(":id/start")
  async startActivity(@Headers("x-gamad-actor-id") actorId: string | undefined, @Param("id") id: string) {
    return ok(await this.activityService.startActivity(actorId, id), { events: ["ACTIVITY_STARTED"] });
  }

  @Post(":id/complete")
  async completeActivity(@Headers("x-gamad-actor-id") actorId: string | undefined, @Param("id") id: string) {
    return ok(await this.activityService.completeActivity(actorId, id), { events: ["ACTIVITY_COMPLETED"] });
  }

  @Post(":id/archive")
  async archiveActivity(@Headers("x-gamad-actor-id") actorId: string | undefined, @Param("id") id: string, @Body() dto: ActivityDecisionDto) {
    return ok(await this.activityService.archiveActivity(actorId, id, dto), { events: ["ACTIVITY_ARCHIVED"] });
  }

  @Post(":activityId/tasks")
  async createTask(@Headers("x-gamad-actor-id") actorId: string | undefined, @Param("activityId") activityId: string, @Body() dto: CreateTaskDto) {
    return ok(await this.activityService.createTask(actorId, activityId, dto), { events: ["TASK_CREATED", "TASK_ASSIGNED"] });
  }

  @Post("tasks/:taskId/complete")
  async completeTask(@Headers("x-gamad-actor-id") actorId: string | undefined, @Param("taskId") taskId: string) {
    return ok(await this.activityService.completeTask(actorId, taskId), { events: ["TASK_COMPLETED"] });
  }

  @Post(":id/reports")
  async submitReport(@Headers("x-gamad-actor-id") actorId: string | undefined, @Param("id") id: string, @Body() dto: ReportDto) {
    return ok(await this.activityService.submitReport(actorId, id, dto), { events: ["REPORT_SUBMITTED"] });
  }
}
