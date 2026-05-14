import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { OrganizationRepository } from './organization.repository';

@Module({
  controllers: [OrganizationController],
  providers: [OrganizationService, OrganizationRepository, PrismaService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
