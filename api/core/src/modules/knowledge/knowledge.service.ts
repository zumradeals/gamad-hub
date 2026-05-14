import { Injectable, NotFoundException } from '@nestjs/common';
import { KnowledgeRepository } from './knowledge.repository';

@Injectable()
export class KnowledgeService {
  constructor(private readonly repo: KnowledgeRepository) {}

  findAll() {
    return this.repo.findAll();
  }

  async findById(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Document not found');
    return item;
  }

  create(data: any) {
    return this.repo.create(data);
  }

  update(id: string, data: any) {
    return this.repo.update(id, data);
  }
}
