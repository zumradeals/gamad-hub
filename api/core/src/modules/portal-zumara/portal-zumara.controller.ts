import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { PortalZumaraService } from './portal-zumara.service';
import { PortalJwtGuard } from '../portal-auth/portal-jwt.guard';
import { CreateZumaraRequestDto } from './dto/create-zumara-request.dto';
import { ZumaraType } from '@prisma/client';

@Controller('portal/zumara')
export class PortalZumaraController {
  constructor(private readonly service: PortalZumaraService) {}

  @Get()
  listPublic(
    @Query('type') type?: ZumaraType,
    @Query('country') country?: string,
    @Query('city') city?: string,
  ) {
    return this.service.listPublic(type, country, city);
  }

  @Get('suggestions')
  getSuggestions(@Query('country') country: string) {
    return this.service.getSuggestions(country ?? '');
  }

  @Get('mine')
  @UseGuards(PortalJwtGuard)
  getMyCells(@Request() req: any) {
    return this.service.getMyCells(req.portalUserId);
  }

  @Get('requests/mine')
  @UseGuards(PortalJwtGuard)
  getMyRequests(@Request() req: any) {
    return this.service.getMyRequests(req.portalUserId);
  }

  @Get('requests/:id')
  @UseGuards(PortalJwtGuard)
  getRequest(@Param('id') id: string, @Request() req: any) {
    return this.service.getRequest(id, req.portalUserId);
  }

  @Post('requests')
  @UseGuards(PortalJwtGuard)
  submitRequest(@Body() dto: CreateZumaraRequestDto, @Request() req: any) {
    return this.service.submitRequest(req.portalUserId, dto);
  }

  @Post(':id/join')
  @UseGuards(PortalJwtGuard)
  join(@Param('id') id: string, @Request() req: any) {
    return this.service.join(id, req.portalUserId);
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.service.getBySlug(slug);
  }
}
