import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class CommunicationRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllThreads() {
    return this.prisma.thread.findMany();
  }

  findThreadById(id: string) {
    return this.prisma.thread.findUnique({ where: { id } });
  }

  createThread(data: any) {
    return this.prisma.thread.create({ data });
  }

  findAllAnnouncements() {
    return this.prisma.announcement.findMany();
  }

  createAnnouncement(data: any) {
    return this.prisma.announcement.create({ data });
  }
}
