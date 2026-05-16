import { Global, Module } from '@nestjs/common';
import { ModuleConfigService } from './module-config.service';
import { ModuleConfigController } from './module-config.controller';
import { PrismaModule } from '../../prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [ModuleConfigController],
  providers: [ModuleConfigService],
  exports: [ModuleConfigService],
})
export class ModuleConfigModule {}
