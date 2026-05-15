import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ZumaraService } from './zumara.service';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { PreValidateDto } from './dto/pre-validate.dto';
import { RejectRequestDto } from './dto/reject-request.dto';
import { UpdateZumaraCellDto } from './dto/update-zumara.dto';
import { SuspendZumaraDto } from './dto/suspend-zumara.dto';
import { ZumaraRequestStatus, ZumaraStatus } from '@prisma/client';

@Controller('zumara')
@UseGuards(PermissionGuard)
export class ZumaraController {
  constructor(private readonly service: ZumaraService) {}

  @Get('requests')
  listRequests(
    @Query('status') status?: ZumaraRequestStatus,
    @Query('country') country?: string,
  ) {
    return this.service.listRequests(status, country);
  }

  @Get('requests/:id')
  getRequest(@Param('id') id: string) {
    return this.service.getRequest(id);
  }

  @Post('requests/:id/pre-validate')
  preValidate(@Param('id') id: string, @Body() dto: PreValidateDto, @Request() req: any) {
    return this.service.preValidate(id, req.user.sub, dto);
  }

  @Post('requests/:id/reject')
  reject(@Param('id') id: string, @Body() dto: RejectRequestDto, @Request() req: any) {
    return this.service.reject(id, req.user.sub, dto);
  }

  @Post('requests/:id/activate')
  activate(@Param('id') id: string, @Request() req: any) {
    return this.service.activate(id, req.user.sub);
  }

  @Get()
  listCells(@Query('status') status?: ZumaraStatus) {
    return this.service.listCells(status);
  }

  @Get(':id')
  getCell(@Param('id') id: string) {
    return this.service.getCell(id);
  }

  @Patch(':id')
  updateCell(@Param('id') id: string, @Body() dto: UpdateZumaraCellDto, @Request() req: any) {
    return this.service.updateCell(id, req.user.sub, dto);
  }

  @Post(':id/suspend')
  suspend(@Param('id') id: string, @Body() dto: SuspendZumaraDto, @Request() req: any) {
    return this.service.suspend(id, req.user.sub, dto);
  }

  @Post(':id/promote-elite')
  promoteElite(@Param('id') id: string, @Request() req: any) {
    return this.service.promoteElite(id, req.user.sub);
  }
}
