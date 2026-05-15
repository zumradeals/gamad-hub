import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { RevelationService } from './revelation.service';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { GrantAccessDto } from './dto/grant-access.dto';
import { SponsorDto } from './dto/sponsor.dto';

@Controller('revelation')
@UseGuards(PermissionGuard)
export class RevelationController {
  constructor(private readonly service: RevelationService) {}

  @Get('events')
  listEvents() {
    return this.service.listEvents();
  }

  @Post('grant')
  grantAccess(@Body() dto: GrantAccessDto, @Request() req: any) {
    return this.service.grantAccess(req.user.sub, dto);
  }

  @Get('candidates')
  getCandidates() {
    return this.service.getCandidates();
  }

  @Post('sponsor')
  sponsor(@Body() dto: SponsorDto, @Request() req: any) {
    return this.service.sponsor(req.user.sub, dto);
  }
}
