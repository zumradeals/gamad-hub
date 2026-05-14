import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';
import { IdentityRepository } from './identity.repository';

@Module({
  controllers: [IdentityController],
  providers: [IdentityService, IdentityRepository, PrismaService],
  exports: [IdentityService],
})
export class IdentityModule {}
