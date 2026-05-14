import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class KnowledgeRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.document.findMany();
  }

  findById(id: string) {
    return this.prisma.document.findUnique({ where: { id } });
  }

  create(data: any) {
    return this.prisma.document.create({ data });
  }

  update(id: string, data: any) {
    return this.prisma.document.update({ where: { id }, data });
  }
}
