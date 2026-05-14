import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { PublicRepository } from './public.repository';

@Module({
  controllers: [PublicController],
  providers: [PublicService, PublicRepository, PrismaService],
  exports: [PublicService],
})
export class PublicModule {}
