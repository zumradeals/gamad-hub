import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CotisationController } from './cotisation.controller';
import { CotisationService } from './cotisation.service';
import { CotisationRepository } from './cotisation.repository';

@Module({
  controllers: [CotisationController],
  providers: [CotisationService, CotisationRepository, PrismaService],
  exports: [CotisationService],
})
export class CotisationModule {}
