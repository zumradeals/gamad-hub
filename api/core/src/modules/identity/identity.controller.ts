import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { IdentityService } from './identity.service';

@Controller('identity')
export class IdentityController {
  constructor(private readonly service: IdentityService) {}

  @Get('gamad-ids')
  findAll() {
    return this.service.findAll();
  }

  @Get('gamad-ids/:id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post('gamad-ids')
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Patch('gamad-ids/:id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }
}
