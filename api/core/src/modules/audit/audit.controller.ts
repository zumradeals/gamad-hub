import { Controller, Get, Param } from '@nestjs/common';
import { AuditService } from './audit.service';

@Controller('audit')
export class AuditController {
  constructor(private readonly service: AuditService) {}

  @Get('events')
  findAll() {
    return this.service.findAll();
  }

  @Get('events/:id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }
}
