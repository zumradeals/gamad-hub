import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma.module';
import { AuditModule } from '../audit/audit.module';
import { ZumaraController } from './zumara.controller';
import { ZumaraService } from './zumara.service';
import { ZumaraRepository } from './zumara.repository';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [ZumaraController],
  providers: [ZumaraService, ZumaraRepository],
  exports: [ZumaraService],
})
export class ZumaraModule {}
