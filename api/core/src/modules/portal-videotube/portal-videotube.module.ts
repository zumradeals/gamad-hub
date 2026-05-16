import { Module } from '@nestjs/common';
import { PortalVideoTubeController, PortalChannelController } from './portal-videotube.controller';
import { PortalVideoTubeService } from './portal-videotube.service';
import { PortalVideoTubeRepository } from './portal-videotube.repository';
import { ZahabModule } from '../zahab/zahab.module';
import { PrismaService } from '../../prisma.service';

@Module({
  imports: [ZahabModule],
  controllers: [PortalVideoTubeController, PortalChannelController],
  providers: [PortalVideoTubeService, PortalVideoTubeRepository, PrismaService],
})
export class PortalVideoTubeModule {}
