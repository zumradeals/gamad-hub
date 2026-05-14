import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { CotisationService } from './cotisation.service';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { ActorId as Actor } from '../../common/decorators/actor.decorator';
import { CreatePeriodDto } from './dto/create-period.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';

@UseGuards(PermissionGuard)
@Controller('cotisation')
export class CotisationController {
  constructor(private readonly service: CotisationService) {}

  // ── Periods ───────────────────────────────────────────────────────────────

  @Get('periods')
  findAllPeriods() {
    return this.service.findAllPeriods();
  }

  @Get('periods/:id')
  findPeriodById(@Param('id') id: string) {
    return this.service.findPeriodById(id);
  }

  @Post('periods')
  createPeriod(@Actor() actorId: string, @Body() dto: CreatePeriodDto) {
    return this.service.createPeriod(actorId, dto);
  }

  @Post('periods/:id/deactivate')
  @HttpCode(HttpStatus.OK)
  deactivatePeriod(@Actor() actorId: string, @Param('id') id: string) {
    return this.service.deactivatePeriod(actorId, id);
  }

  // ── Payments ──────────────────────────────────────────────────────────────

  @Get('payments')
  findAllPayments(
    @Query('gamadId') gamadId?: string,
    @Query('periodId') periodId?: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(50), ParseIntPipe) take?: number,
  ) {
    return this.service.findAllPayments({ gamadId, periodId, skip, take });
  }

  @Get('my/payments')
  findMyPayments(@Actor() actorId: string) {
    return this.service.findMyPayments(actorId);
  }

  @Get('my/status')
  getMyStatus(@Actor() actorId: string) {
    return this.service.getMyStatus(actorId);
  }

  @Post('payments')
  recordPayment(@Actor() actorId: string, @Body() dto: RecordPaymentDto) {
    return this.service.recordPayment(actorId, dto);
  }
}
