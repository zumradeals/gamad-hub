import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IdentityService } from './identity.service';
import { CreateGamadIdDto } from './dto/create-gamad-id.dto';
import { ValidateIdentityDto } from './dto/validate-identity.dto';
import { SuspendIdentityDto } from './dto/suspend-identity.dto';
import { ListQueryDto } from './dto/list-query.dto';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { ActorId } from '../../common/decorators/actor.decorator';

@Controller('identity')
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @Get('gamad-ids')
  @UseGuards(PermissionGuard)
  findAll(@Query() query: ListQueryDto) {
    return this.identityService.findAll({
      skip: query.skip,
      take: query.take,
      status: query.status,
      search: query.search,
    });
  }

  @Post('gamad-ids')
  @UseGuards(PermissionGuard)
  create(@Body() dto: CreateGamadIdDto, @ActorId() actorId: string) {
    return this.identityService.create(dto, actorId);
  }

  @Get('gamad-ids/:id')
  @UseGuards(PermissionGuard)
  findById(@Param('id') id: string) {
    return this.identityService.findById(id);
  }

  @Post('gamad-ids/:id/validate')
  @UseGuards(PermissionGuard)
  validate(
    @Param('id') id: string,
    @Body() dto: ValidateIdentityDto,
    @ActorId() actorId: string,
  ) {
    return this.identityService.validate(id, dto, actorId);
  }

  @Post('gamad-ids/:id/suspend')
  @UseGuards(PermissionGuard)
  suspend(
    @Param('id') id: string,
    @Body() dto: SuspendIdentityDto,
    @ActorId() actorId: string,
  ) {
    return this.identityService.suspend(id, dto, actorId);
  }
}
