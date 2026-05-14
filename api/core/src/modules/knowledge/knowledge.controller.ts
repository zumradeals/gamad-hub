import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';

@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly service: KnowledgeService) {}

  @Get('documents')
  findAll() {
    return this.service.findAll();
  }

  @Get('documents/:id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post('documents')
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Patch('documents/:id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }
}
