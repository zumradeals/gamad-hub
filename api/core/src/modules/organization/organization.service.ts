import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationRepository } from './organization.repository';

@Injectable()
export class OrganizationService {
  constructor(private readonly repo: OrganizationRepository) {}

  findAllUnits() {
    return this.repo.findAllUnits();
  }

  async findUnitById(id: string) {
    const item = await this.repo.findUnitById(id);
    if (!item) throw new NotFoundException('Organization unit not found');
    return item;
  }

  createUnit(data: any) {
    return this.repo.createUnit(data);
  }

  updateUnit(id: string, data: any) {
    return this.repo.updateUnit(id, data);
  }
}
