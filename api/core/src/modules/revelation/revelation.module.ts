import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma.module';
import { AuditModule } from '../audit/audit.module';
import { RevelationController } from './revelation.controller';
import { RevelationService } from './revelation.service';
import { RevelationRepository } from './revelation.repository';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [RevelationController],
  providers: [RevelationService, RevelationRepository],
  exports: [RevelationService],
})
export class RevelationModule {}
