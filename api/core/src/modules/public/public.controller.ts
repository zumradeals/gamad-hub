import { Controller, Get } from '@nestjs/common';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private readonly service: PublicService) {}

  @Get('articles')
  findPublishedArticles() {
    return this.service.findPublishedArticles();
  }

  @Get('videos')
  findPublishedVideos() {
    return this.service.findPublishedVideos();
  }

  @Get('formations')
  findPublicFormations() {
    return this.service.findPublicFormations();
  }
}
