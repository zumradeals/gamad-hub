import { Controller, Get } from '@nestjs/common';
import { CotisationService } from './cotisation.service';

@Controller('cotisation')
export class CotisationController {
  constructor(private readonly service: CotisationService) {}

  @Get('periods')
  findAllPeriods() {
    return this.service.findAllPeriods();
  }

  @Get('payments')
  findAllPayments() {
    return this.service.findAllPayments();
  }
}
