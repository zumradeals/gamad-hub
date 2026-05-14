import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CommunicationController } from './communication.controller';
import { CommunicationService } from './communication.service';
import { CommunicationRepository } from './communication.repository';

@Module({
  controllers: [CommunicationController],
  providers: [CommunicationService, CommunicationRepository, PrismaService],
  exports: [CommunicationService],
})
export class CommunicationModule {}
