import {
  Body, Controller, Get, Param, Post, Query, Req, UseGuards,
} from '@nestjs/common';
import { PortalMarketService } from './portal-market.service';
import { PortalJwtGuard } from '../portal-auth/portal-jwt.guard';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('portal/market')
export class PortalMarketController {
  constructor(private readonly service: PortalMarketService) {}

  /* ── Products ── */

  @Get()
  list(
    @Query('page') page = '1',
    @Query('category') category?: string,
    @Query('country') country?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    return this.service.listProducts(Number(page) || 1, {
      category, country, type, search,
      minPrice: minPrice != null ? Number(minPrice) : undefined,
      maxPrice: maxPrice != null ? Number(maxPrice) : undefined,
    });
  }

  @Get('my-orders')
  @UseGuards(PortalJwtGuard)
  myOrders(@Req() req: any) {
    return this.service.getMyOrders(req.portalUserId);
  }

  @Get(':productId')
  getProduct(@Param('productId') productId: string) {
    return this.service.getProduct(productId);
  }

  /* ── Orders ── */

  @Post(':productId/order')
  @UseGuards(PortalJwtGuard)
  placeOrder(
    @Param('productId') productId: string,
    @Req() req: any,
    @Body() dto: CreateOrderDto,
  ) {
    return this.service.placeOrder(productId, req.portalUserId, dto);
  }
}
