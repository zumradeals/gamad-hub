import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { PortalJwtGuard } from '../portal-auth/portal-jwt.guard';
import { PortalMessagesService } from './portal-messages.service';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

class SendMessageDto {
  @IsString() @IsNotEmpty() recipientPublicCode: string;
  @IsString() @IsNotEmpty() @MaxLength(2000) content: string;
}

@Controller('portal/messages')
@UseGuards(PortalJwtGuard)
export class PortalMessagesController {
  constructor(private readonly service: PortalMessagesService) {}

  @Get('inbox')
  inbox(@Req() req: any) {
    return this.service.getInbox(req.portalUserId);
  }

  @Get('sent')
  sent(@Req() req: any) {
    return this.service.getSent(req.portalUserId);
  }

  @Get('unread-count')
  unreadCount(@Req() req: any) {
    return this.service.countUnread(req.portalUserId);
  }

  @Get(':id')
  getMessage(@Param('id') id: string, @Req() req: any) {
    return this.service.getMessage(id, req.portalUserId);
  }

  @Post()
  send(@Req() req: any, @Body() dto: SendMessageDto) {
    return this.service.send(req.portalUserId, dto.recipientPublicCode, dto.content);
  }
}
