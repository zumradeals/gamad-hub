import { Injectable, NotFoundException } from '@nestjs/common';
import { CommunicationRepository } from './communication.repository';

@Injectable()
export class CommunicationService {
  constructor(private readonly repo: CommunicationRepository) {}

  findAllThreads() {
    return this.repo.findAllThreads();
  }

  async findThreadById(id: string) {
    const item = await this.repo.findThreadById(id);
    if (!item) throw new NotFoundException('Thread not found');
    return item;
  }

  createThread(data: any) {
    return this.repo.createThread(data);
  }

  findAllAnnouncements() {
    return this.repo.findAllAnnouncements();
  }

  createAnnouncement(data: any) {
    return this.repo.createAnnouncement(data);
  }
}
