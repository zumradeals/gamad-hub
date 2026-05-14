import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommunicationService } from './communication.service';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Actor } from '../../common/decorators/actor.decorator';
import { CreateThreadDto } from './dto/create-thread.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { ReactPostDto } from './dto/react-post.dto';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { SendMessageDto } from './dto/send-message.dto';

@UseGuards(PermissionGuard)
@Controller('communication')
export class CommunicationController {
  constructor(private readonly service: CommunicationService) {}

  // ── Threads ───────────────────────────────────────────────────────────────

  @Get('threads')
  findAllThreads(
    @Query('unitId') unitId?: string,
    @Query('visibility') visibility?: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(30), ParseIntPipe) take?: number,
  ) {
    return this.service.findAllThreads({ unitId, visibility, skip, take });
  }

  @Get('threads/:id')
  findThreadById(@Param('id') id: string) {
    return this.service.findThreadById(id);
  }

  @Post('threads')
  createThread(@Actor() actorId: string, @Body() dto: CreateThreadDto) {
    return this.service.createThread(actorId, dto);
  }

  @Patch('threads/:id')
  updateThread(@Actor() actorId: string, @Param('id') id: string, @Body() dto: UpdateThreadDto) {
    return this.service.updateThread(actorId, id, dto);
  }

  // ── Posts ─────────────────────────────────────────────────────────────────

  @Post('threads/:threadId/posts')
  createPost(
    @Actor() actorId: string,
    @Param('threadId') threadId: string,
    @Body() dto: CreatePostDto,
  ) {
    return this.service.createPost(actorId, threadId, dto);
  }

  @Patch('posts/:id')
  updatePost(@Actor() actorId: string, @Param('id') id: string, @Body() dto: CreatePostDto) {
    return this.service.updatePost(actorId, id, { content: dto.content });
  }

  @Post('posts/:id/react')
  @HttpCode(HttpStatus.OK)
  reactToPost(@Actor() actorId: string, @Param('id') id: string, @Body() dto: ReactPostDto) {
    return this.service.reactToPost(actorId, id, dto);
  }

  // ── Announcements ─────────────────────────────────────────────────────────

  @Get('announcements')
  findAllAnnouncements(
    @Query('unitId') unitId?: string,
    @Query('audienceScope') audienceScope?: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(20), ParseIntPipe) take?: number,
  ) {
    return this.service.findAllAnnouncements({ unitId, audienceScope, skip, take });
  }

  @Get('announcements/:id')
  findAnnouncementById(@Param('id') id: string) {
    return this.service.findAnnouncementById(id);
  }

  @Post('announcements')
  createAnnouncement(@Actor() actorId: string, @Body() dto: CreateAnnouncementDto) {
    return this.service.createAnnouncement(actorId, dto);
  }

  @Patch('announcements/:id')
  updateAnnouncement(
    @Actor() actorId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateAnnouncementDto>,
  ) {
    return this.service.updateAnnouncement(actorId, id, { title: dto.title, content: dto.content });
  }

  // ── Messages ──────────────────────────────────────────────────────────────

  @Get('messages/received')
  findReceivedMessages(@Actor() actorId: string) {
    return this.service.findReceivedMessages(actorId);
  }

  @Get('messages/sent')
  findSentMessages(@Actor() actorId: string) {
    return this.service.findSentMessages(actorId);
  }

  @Get('messages/:id')
  findMessageById(@Actor() actorId: string, @Param('id') id: string) {
    return this.service.findMessageById(actorId, id);
  }

  @Post('messages')
  sendMessage(@Actor() actorId: string, @Body() dto: SendMessageDto) {
    return this.service.sendMessage(actorId, dto);
  }

  @Patch('messages/:id/read')
  @HttpCode(HttpStatus.OK)
  markMessageRead(@Actor() actorId: string, @Param('id') id: string) {
    return this.service.markMessageRead(actorId, id);
  }

  @Patch('messages/:id/archive')
  @HttpCode(HttpStatus.OK)
  archiveMessage(@Actor() actorId: string, @Param('id') id: string) {
    return this.service.archiveMessage(actorId, id);
  }

  // ── Notifications ─────────────────────────────────────────────────────────

  @Get('notifications')
  findNotifications(
    @Actor() actorId: string,
    @Query('unread') unread?: string,
  ) {
    return this.service.findNotifications(actorId, unread === 'true');
  }

  @Patch('notifications/:id/read')
  @HttpCode(HttpStatus.OK)
  markNotificationRead(@Actor() actorId: string, @Param('id') id: string) {
    return this.service.markNotificationRead(actorId, id);
  }

  @Patch('notifications/read-all')
  @HttpCode(HttpStatus.OK)
  markAllNotificationsRead(@Actor() actorId: string) {
    return this.service.markAllNotificationsRead(actorId);
  }
}
