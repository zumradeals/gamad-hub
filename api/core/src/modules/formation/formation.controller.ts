import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FormationService } from './formation.service';
import { CreateFormationDto } from './dto/create-formation.dto';
import { UpdateFormationDto } from './dto/update-formation.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { EnrollDto } from './dto/enroll.dto';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { ActorId } from '../../common/decorators/actor.decorator';

@Controller('formation')
@UseGuards(PermissionGuard)
export class FormationController {
  constructor(private readonly service: FormationService) {}

  // ── Formations ────────────────────────────────────────────────────────────

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('isPublic') isPublic?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.service.findAll({
      status,
      isPublic: isPublic !== undefined ? isPublic === 'true' : undefined,
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
    });
  }

  @Post()
  create(@Body() dto: CreateFormationDto, @ActorId() actorId: string) {
    return this.service.create(dto, actorId);
  }

  @Get('my-enrollments')
  myEnrollments(@ActorId() actorId: string) {
    return this.service.findMyEnrollments(actorId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFormationDto, @ActorId() actorId: string) {
    return this.service.update(id, dto, actorId);
  }

  @Post(':id/publish')
  publish(@Param('id') id: string, @ActorId() actorId: string) {
    return this.service.publish(id, actorId);
  }

  @Post(':id/archive')
  archive(@Param('id') id: string, @ActorId() actorId: string) {
    return this.service.archive(id, actorId);
  }

  // ── Modules ───────────────────────────────────────────────────────────────

  @Get(':id/modules')
  findModules(@Param('id') id: string) {
    return this.service.findModules(id);
  }

  @Post(':id/modules')
  addModule(
    @Param('id') formationId: string,
    @Body() dto: CreateModuleDto,
    @ActorId() actorId: string,
  ) {
    return this.service.addModule(formationId, dto, actorId);
  }

  @Patch(':formationId/modules/:moduleId')
  updateModule(
    @Param('formationId') formationId: string,
    @Param('moduleId') moduleId: string,
    @Body() dto: CreateModuleDto,
    @ActorId() actorId: string,
  ) {
    return this.service.updateModule(formationId, moduleId, dto, actorId);
  }

  @Delete(':formationId/modules/:moduleId')
  deleteModule(
    @Param('formationId') formationId: string,
    @Param('moduleId') moduleId: string,
    @ActorId() actorId: string,
  ) {
    return this.service.deleteModule(formationId, moduleId, actorId);
  }

  // ── Enrollments ───────────────────────────────────────────────────────────

  @Get(':id/enrollments')
  findEnrollments(@Param('id') id: string) {
    return this.service.findEnrollments(id);
  }

  @Post(':id/enroll')
  enroll(
    @Param('id') formationId: string,
    @Body() dto: EnrollDto,
    @ActorId() actorId: string,
  ) {
    const gamadId = dto.gamadId ?? actorId;
    return this.service.enroll(formationId, gamadId, actorId);
  }

  @Post(':id/unenroll')
  unenroll(@Param('id') formationId: string, @ActorId() actorId: string) {
    return this.service.unenroll(formationId, actorId, actorId);
  }

  // ── Progress ──────────────────────────────────────────────────────────────

  @Post(':formationId/modules/:moduleId/complete')
  completeModule(
    @Param('formationId') formationId: string,
    @Param('moduleId') moduleId: string,
    @ActorId() actorId: string,
  ) {
    return this.service.completeModule(formationId, moduleId, actorId, actorId);
  }

  @Get(':id/progress/:gamadId')
  getProgress(@Param('id') formationId: string, @Param('gamadId') gamadId: string) {
    return this.service.getProgress(formationId, gamadId);
  }
}
