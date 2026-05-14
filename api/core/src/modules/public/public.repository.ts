import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class PublicRepository {
  constructor(private readonly prisma: PrismaService) {}

  findPublishedArticles() {
    return this.prisma.article.findMany({ where: { published: true } });
  }

  findPublishedVideos() {
    return this.prisma.video.findMany({ where: { published: true } });
  }

  findPublicFormations() {
    return this.prisma.formation.findMany({ where: { isPublic: true } });
  }
}
