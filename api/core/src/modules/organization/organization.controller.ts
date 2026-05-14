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
import { OrganizationService } from './organization.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { AssignMemberDto } from './dto/assign-member.dto';
import { ArchiveUnitDto } from './dto/archive-unit.dto';
import { CreateZumaraDto } from './dto/create-zumara.dto';
import { RemoveMemberDto } from './dto/remove-member.dto';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { ActorId } from '../../common/decorators/actor.decorator';

@Controller('organization')
@UseGuards(PermissionGuard)
export class OrganizationController {
  constructor(private readonly service: OrganizationService) {}

  // ── Units ────────────────────────────────────────────────────────────────

  @Get('units')
  findAllUnits(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('parentId') parentId?: string,
  ) {
    return this.service.findAllUnits({ type, status, parentId });
  }

  @Post('units')
  createUnit(@Body() dto: CreateUnitDto, @ActorId() actorId: string) {
    return this.service.createUnit(dto, actorId);
  }

  @Get('units/:id')
  findUnitById(@Param('id') id: string) {
    return this.service.findUnitById(id);
  }

  @Patch('units/:id')
  updateUnit(
    @Param('id') id: string,
    @Body() dto: UpdateUnitDto,
    @ActorId() actorId: string,
  ) {
    return this.service.updateUnit(id, dto, actorId);
  }

  @Post('units/:id/archive')
  archiveUnit(
    @Param('id') id: string,
    @Body() dto: ArchiveUnitDto,
    @ActorId() actorId: string,
  ) {
    return this.service.archiveUnit(id, dto, actorId);
  }

  // ── Members ──────────────────────────────────────────────────────────────

  @Get('units/:id/members')
  findMembers(@Param('id') id: string) {
    return this.service.findMembers(id);
  }

  @Post('units/:id/members')
  assignMember(
    @Param('id') unitId: string,
    @Body() dto: AssignMemberDto,
    @ActorId() actorId: string,
  ) {
    return this.service.assignMember(unitId, dto, actorId);
  }

  @Delete('units/:unitId/members/:membershipId')
  removeMember(
    @Param('unitId') unitId: string,
    @Param('membershipId') membershipId: string,
    @Body() dto: RemoveMemberDto,
    @ActorId() actorId: string,
  ) {
    return this.service.removeMember(unitId, membershipId, dto, actorId);
  }

  // ── Zumara ────────────────────────────────────────────────────────────────

  @Get('zumara')
  findAllZumara() {
    return this.service.findAllZumara();
  }

  @Get('zumara/:id')
  findZumaraById(@Param('id') id: string) {
    return this.service.findZumaraById(id);
  }

  @Post('units/:id/zumara')
  createZumara(
    @Param('id') unitId: string,
    @Body() dto: CreateZumaraDto,
    @ActorId() actorId: string,
  ) {
    return this.service.createZumara(unitId, dto, actorId);
  }

  @Patch('zumara/:id')
  updateZumara(
    @Param('id') id: string,
    @Body() dto: CreateZumaraDto,
    @ActorId() actorId: string,
  ) {
    return this.service.updateZumara(id, dto, actorId);
  }
}
