import { Injectable, NotFoundException } from '@nestjs/common';
import { IdentityRepository } from './identity.repository';

@Injectable()
export class IdentityService {
  constructor(private readonly repo: IdentityRepository) {}

  findAll() {
    return this.repo.findAll();
  }

  async findById(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('GAMAD ID not found');
    return item;
  }

  create(data: any) {
    return this.repo.create(data);
  }

  update(id: string, data: any) {
    return this.repo.update(id, data);
  }
}
