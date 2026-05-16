import { Module } from '@nestjs/common';
import { PortalMarketController } from './portal-market.controller';
import { PortalMarketService } from './portal-market.service';
import { PortalMarketRepository } from './portal-market.repository';
import { PrismaModule } from '../../prisma.module';
import { PortalAuthModule } from '../portal-auth/portal-auth.module';
import { ZahabModule } from '../zahab/zahab.module';

@Module({
  imports: [PrismaModule, PortalAuthModule, ZahabModule],
  controllers: [PortalMarketController],
  providers: [PortalMarketService, PortalMarketRepository],
})
export class PortalMarketModule {}
