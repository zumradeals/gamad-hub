import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { FormationController } from './formation.controller';
import { FormationService } from './formation.service';
import { FormationRepository } from './formation.repository';

@Module({
  controllers: [FormationController],
  providers: [FormationService, FormationRepository, PrismaService],
  exports: [FormationService],
})
export class FormationModule {}
