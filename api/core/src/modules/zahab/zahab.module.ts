import { Module, forwardRef } from '@nestjs/common';
import { ZahabController } from './zahab.controller';
import { ZahabService } from './zahab.service';
import { ZahabRepository } from './zahab.repository';
import { PortalAuthModule } from '../portal-auth/portal-auth.module';
import { PrismaModule } from '../../prisma.module';

@Module({
  imports: [PrismaModule, forwardRef(() => PortalAuthModule)],
  controllers: [ZahabController],
  providers: [ZahabService, ZahabRepository],
  exports: [ZahabService],
})
export class ZahabModule {}
