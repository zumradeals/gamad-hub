import {
  Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards,
} from '@nestjs/common';
import { PortalFeedService } from './portal-feed.service';
import { CreateFeedPostDto } from './dto/create-feed-post.dto';
import { PortalJwtGuard } from '../portal-auth/portal-jwt.guard';

@Controller('portal/feed')
export class PortalFeedController {
  constructor(private readonly service: PortalFeedService) {}

  @Get()
  getFeed(@Query('page') page = '1') {
    return this.service.getFeed(Number(page));
  }

  @Post()
  @UseGuards(PortalJwtGuard)
  createPost(@Req() req: any, @Body() dto: CreateFeedPostDto) {
    return this.service.createPost(req.portalUserId, dto);
  }

  @Post(':id/react')
  @UseGuards(PortalJwtGuard)
  react(@Req() req: any, @Param('id') id: string, @Body('emoji') emoji: string) {
    return this.service.react(id, req.portalUserId, emoji);
  }

  @Delete(':id')
  @UseGuards(PortalJwtGuard)
  deletePost(@Req() req: any, @Param('id') id: string) {
    return this.service.deletePost(id, req.portalUserId);
  }
}
