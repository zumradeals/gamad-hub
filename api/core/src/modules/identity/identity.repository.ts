import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class IdentityRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.gamadId.findMany({ include: { profile: true, account: true } });
  }

  findById(id: string) {
    return this.prisma.gamadId.findUnique({ where: { id }, include: { profile: true, account: true } });
  }

  create(data: any) {
    return this.prisma.gamadId.create({ data });
  }

  update(id: string, data: any) {
    return this.prisma.gamadId.update({ where: { id }, data });
  }
}
