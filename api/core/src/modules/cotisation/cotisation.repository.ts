import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class CotisationRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllPeriods() {
    return this.prisma.cotisationPeriod.findMany();
  }

  findAllPayments() {
    return this.prisma.cotisationPayment.findMany();
  }
}
