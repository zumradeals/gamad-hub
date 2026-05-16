import { Module } from '@nestjs/common';
import { PortalVideoTubeController } from './portal-videotube.controller';
import { PortalVideoTubeService } from './portal-videotube.service';
import { PortalVideoTubeRepository } from './portal-videotube.repository';
import { ZahabModule } from '../zahab/zahab.module';
import { PrismaService } from '../../prisma.service';

@Module({
  imports: [ZahabModule],
  controllers: [PortalVideoTubeController],
  providers: [PortalVideoTubeService, PortalVideoTubeRepository, PrismaService],
})
export class PortalVideoTubeModule {}
