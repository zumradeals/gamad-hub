import { Injectable, NotFoundException } from '@nestjs/common';
import { FormationRepository } from './formation.repository';

@Injectable()
export class FormationService {
  constructor(private readonly repo: FormationRepository) {}

  findAll() {
    return this.repo.findAll();
  }

  async findById(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Formation not found');
    return item;
  }

  create(data: any) {
    return this.repo.create(data);
  }

  update(id: string, data: any) {
    return this.repo.update(id, data);
  }
}
