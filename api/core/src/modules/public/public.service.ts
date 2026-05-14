import { Injectable } from '@nestjs/common';
import { PublicRepository } from './public.repository';

@Injectable()
export class PublicService {
  constructor(private readonly repo: PublicRepository) {}

  findPublishedArticles() {
    return this.repo.findPublishedArticles();
  }

  findPublishedVideos() {
    return this.repo.findPublishedVideos();
  }

  findPublicFormations() {
    return this.repo.findPublicFormations();
  }
}
