import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ZahabService } from './zahab.service';
import { TransferDto } from './dto/transfer.dto';
import { PortalJwtGuard } from '../portal-auth/portal-jwt.guard';

@Controller('portal/wallet')
@UseGuards(PortalJwtGuard)
export class ZahabController {
  constructor(private readonly service: ZahabService) {}

  @Get()
  getMyWallet(@Req() req: any) {
    return this.service.getMyWallet(req.portalUserId);
  }

  @Get('transactions')
  getTransactions(@Req() req: any) {
    return this.service.getTransactions(req.portalUserId);
  }

  @Post('transfer')
  transfer(@Req() req: any, @Body() dto: TransferDto) {
    return this.service.transfer(req.portalUserId, dto.toGamadId, dto.amount, dto.note);
  }
}
