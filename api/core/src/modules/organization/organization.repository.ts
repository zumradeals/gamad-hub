import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class OrganizationRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllUnits() {
    return this.prisma.organizationUnit.findMany();
  }

  findUnitById(id: string) {
    return this.prisma.organizationUnit.findUnique({ where: { id } });
  }

  createUnit(data: any) {
    return this.prisma.organizationUnit.create({ data });
  }

  updateUnit(id: string, data: any) {
    return this.prisma.organizationUnit.update({ where: { id }, data });
  }
}
