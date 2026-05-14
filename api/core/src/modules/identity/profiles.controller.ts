import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { IdentityService } from './identity.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { ActorId } from '../../common/decorators/actor.decorator';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly identityService: IdentityService) {}

  @Get(':gamadId')
  @UseGuards(PermissionGuard)
  findProfile(@Param('gamadId') gamadId: string) {
    return this.identityService.findProfile(gamadId);
  }

  @Patch(':gamadId')
  @UseGuards(PermissionGuard)
  updateProfile(
    @Param('gamadId') gamadId: string,
    @Body() dto: UpdateProfileDto,
    @ActorId() actorId: string,
  ) {
    return this.identityService.updateProfile(gamadId, dto, actorId);
  }
}
