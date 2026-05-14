import { Injectable } from '@nestjs/common';
import { CotisationRepository } from './cotisation.repository';

@Injectable()
export class CotisationService {
  constructor(private readonly repo: CotisationRepository) {}

  findAllPeriods() {
    return this.repo.findAllPeriods();
  }

  findAllPayments() {
    return this.repo.findAllPayments();
  }
}
