import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ActivityService } from './activity.service';

@Controller('activity')
export class ActivityController {
  constructor(private readonly service: ActivityService) {}

  @Get('activities')
  findAll() {
    return this.service.findAll();
  }

  @Get('activities/:id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post('activities')
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Patch('activities/:id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }
}
