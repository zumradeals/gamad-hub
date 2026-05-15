import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma.module';
import { PortalProfilesController } from './portal-profiles.controller';
import { PortalProfilesRepository } from './portal-profiles.repository';

@Module({
  imports: [PrismaModule],
  controllers: [PortalProfilesController],
  providers: [PortalProfilesRepository],
})
export class PortalProfilesModule {}
