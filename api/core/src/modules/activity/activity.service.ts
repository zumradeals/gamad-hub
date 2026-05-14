import { Injectable, NotFoundException } from '@nestjs/common';
import { ActivityRepository } from './activity.repository';

@Injectable()
export class ActivityService {
  constructor(private readonly repo: ActivityRepository) {}

  findAll() {
    return this.repo.findAll();
  }

  async findById(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Activity not found');
    return item;
  }

  create(data: any) {
    return this.repo.create(data);
  }

  update(id: string, data: any) {
    return this.repo.update(id, data);
  }
}
