import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class ActivityRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.activity.findMany();
  }

  findById(id: string) {
    return this.prisma.activity.findUnique({ where: { id } });
  }

  create(data: any) {
    return this.prisma.activity.create({ data });
  }

  update(id: string, data: any) {
    return this.prisma.activity.update({ where: { id }, data });
  }
}
