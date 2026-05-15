import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma.module';
import { PortalAuthModule } from '../portal-auth/portal-auth.module';
import { PortalMessagesController } from './portal-messages.controller';
import { PortalMessagesRepository } from './portal-messages.repository';
import { PortalMessagesService } from './portal-messages.service';

@Module({
  imports: [PrismaModule, PortalAuthModule],
  controllers: [PortalMessagesController],
  providers: [PortalMessagesRepository, PortalMessagesService],
})
export class PortalMessagesModule {}
