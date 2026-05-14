import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class FormationRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.formation.findMany();
  }

  findById(id: string) {
    return this.prisma.formation.findUnique({ where: { id } });
  }

  create(data: any) {
    return this.prisma.formation.create({ data });
  }

  update(id: string, data: any) {
    return this.prisma.formation.update({ where: { id }, data });
  }
}
