import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Actor } from '../../common/decorators/actor.decorator';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { RejectActivityDto } from './dto/reject-activity.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { CreateReportDto } from './dto/create-report.dto';

@UseGuards(PermissionGuard)
@Controller('activities')
export class ActivityController {
  constructor(private readonly service: ActivityService) {}

  // ── Activities ────────────────────────────────────────────────────────────

  @Get()
  findAll(
    @Query('unitId') unitId?: string,
    @Query('status') status?: string,
    @Query('ownerId') ownerId?: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(30), ParseIntPipe) take?: number,
  ) {
    return this.service.findAll({ unitId, status, ownerId, skip, take });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  create(@Actor() actorId: string, @Body() dto: CreateActivityDto) {
    return this.service.create(actorId, dto);
  }

  @Patch(':id')
  update(@Actor() actorId: string, @Param('id') id: string, @Body() dto: UpdateActivityDto) {
    return this.service.update(actorId, id, dto);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  submit(@Actor() actorId: string, @Param('id') id: string) {
    return this.service.submit(actorId, id);
  }

  @Post(':id/validate')
  @HttpCode(HttpStatus.OK)
  validate(@Actor() actorId: string, @Param('id') id: string) {
    return this.service.validate(actorId, id);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  reject(@Actor() actorId: string, @Param('id') id: string, @Body() dto: RejectActivityDto) {
    return this.service.reject(actorId, id, dto);
  }

  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  start(@Actor() actorId: string, @Param('id') id: string) {
    return this.service.start(actorId, id);
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  complete(@Actor() actorId: string, @Param('id') id: string) {
    return this.service.complete(actorId, id);
  }

  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  archive(@Actor() actorId: string, @Param('id') id: string) {
    return this.service.archive(actorId, id);
  }

  // ── Tasks ─────────────────────────────────────────────────────────────────

  @Post(':activityId/tasks')
  createTask(
    @Actor() actorId: string,
    @Param('activityId') activityId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.service.createTask(actorId, activityId, dto);
  }

  @Post('tasks/:taskId/complete')
  @HttpCode(HttpStatus.OK)
  completeTask(@Actor() actorId: string, @Param('taskId') taskId: string) {
    return this.service.completeTask(actorId, taskId);
  }

  // ── Reports ───────────────────────────────────────────────────────────────

  @Post(':activityId/reports')
  createReport(
    @Actor() actorId: string,
    @Param('activityId') activityId: string,
    @Body() dto: CreateReportDto,
  ) {
    return this.service.createReport(actorId, activityId, dto);
  }
}
