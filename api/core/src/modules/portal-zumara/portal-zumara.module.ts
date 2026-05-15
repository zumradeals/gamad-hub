import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma.module';
import { PortalZumaraController } from './portal-zumara.controller';
import { PortalZumaraService } from './portal-zumara.service';
import { PortalZumaraRepository } from './portal-zumara.repository';
import { PortalJwtGuard } from '../portal-auth/portal-jwt.guard';

@Module({
  imports: [PrismaModule],
  controllers: [PortalZumaraController],
  providers: [PortalZumaraService, PortalZumaraRepository, PortalJwtGuard],
})
export class PortalZumaraModule {}
