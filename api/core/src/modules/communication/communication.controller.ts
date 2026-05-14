import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { CommunicationService } from './communication.service';

@Controller('communication')
export class CommunicationController {
  constructor(private readonly service: CommunicationService) {}

  @Get('threads')
  findAllThreads() {
    return this.service.findAllThreads();
  }

  @Get('threads/:id')
  findThreadById(@Param('id') id: string) {
    return this.service.findThreadById(id);
  }

  @Post('threads')
  createThread(@Body() body: any) {
    return this.service.createThread(body);
  }

  @Get('announcements')
  findAllAnnouncements() {
    return this.service.findAllAnnouncements();
  }

  @Post('announcements')
  createAnnouncement(@Body() body: any) {
    return this.service.createAnnouncement(body);
  }
}
