import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { OrganizationService } from './organization.service';

@Controller('organization')
export class OrganizationController {
  constructor(private readonly service: OrganizationService) {}

  @Get('units')
  findAllUnits() {
    return this.service.findAllUnits();
  }

  @Get('units/:id')
  findUnitById(@Param('id') id: string) {
    return this.service.findUnitById(id);
  }

  @Post('units')
  createUnit(@Body() body: any) {
    return this.service.createUnit(body);
  }

  @Patch('units/:id')
  updateUnit(@Param('id') id: string, @Body() body: any) {
    return this.service.updateUnit(id, body);
  }
}
