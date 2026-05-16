import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { PageProductType } from '@prisma/client';
import { PortalMarketRepository } from './portal-market.repository';
import { ZahabService } from '../zahab/zahab.service';
import { CreateOrderDto } from './dto/create-order.dto';

const FIAT_INSTRUCTIONS: Record<string, string> = {
  WAVE: 'Envoyez le montant au numéro Wave : +XXX XXX XX XX — Indiquez votre numéro de commande en message.',
  ORANGE_MONEY: 'Envoyez le montant au numéro Orange Money : +XXX XXX XX XX — Indiquez votre numéro de commande.',
};

@Injectable()
export class PortalMarketService {
  constructor(
    private readonly repo: PortalMarketRepository,
    private readonly zahab: ZahabService,
  ) {}

  /* ── Listing ── */

  async listProducts(
    page: number,
    opts: {
      category?: string; country?: string;
      minPrice?: number; maxPrice?: number;
      type?: string; search?: string;
    },
  ) {
    const take = 24;
    const skip = (page - 1) * take;
    const type = opts.type as PageProductType | undefined;
    const filters = { ...opts, type };
    const [products, total] = await Promise.all([
      this.repo.findProducts({ skip, take, ...filters }),
      this.repo.countProducts(filters),
    ]);
    return { products, total, page, pages: Math.ceil(total / take) };
  }

  async getProduct(productId: string) {
    const product = await this.repo.findProductById(productId);
    if (!product) throw new NotFoundException('Produit introuvable');
    return product;
  }

  /* ── Orders ── */

  async placeOrder(productId: string, buyerGamadId: string, dto: CreateOrderDto) {
    const product = await this.repo.findProductById(productId);
    if (!product) throw new NotFoundException('Produit introuvable');
    if (!product.available) throw new BadRequestException('Ce produit n\'est plus disponible');
    if (product.price == null) throw new BadRequestException('Ce produit n\'a pas de prix défini');

    const quantity = dto.quantity ?? 1;
    const unitPrice = product.price;
    const totalPrice = unitPrice * quantity;
    const currency = product.currency ?? 'ZAHAB';
    const paymentMethod = dto.paymentMethod;

    let status: 'CONFIRMED' | 'PENDING' = 'PENDING';
    let paymentRef: string | undefined;

    if (paymentMethod === 'ZAHAB') {
      const balance = await this.repo.findWalletBalance(buyerGamadId);
      if (balance < totalPrice) {
        throw new BadRequestException(
          `Solde ZAHAB insuffisant (${balance.toFixed(2)} Z). Montant requis : ${totalPrice.toFixed(2)} Z`,
        );
      }
      const founderId = await this.repo.findPageFounderGamadId(product.page.cell.id);
      if (founderId && founderId !== buyerGamadId) {
        await this.zahab.transfer(
          buyerGamadId,
          founderId,
          totalPrice,
          `Achat Marché : ${product.name} (x${quantity})`,
        );
      }
      status = 'CONFIRMED';
    } else {
      paymentRef = `MKT-${Date.now().toString(36).toUpperCase()}`;
    }

    const order = await this.repo.createOrder({
      productId,
      buyerGamadId,
      quantity,
      unitPrice,
      totalPrice,
      currency,
      paymentMethod,
      status,
      note: dto.note,
      paymentRef,
    });

    const response: any = { order };
    if (paymentMethod !== 'ZAHAB') {
      response.instructions = FIAT_INSTRUCTIONS[paymentMethod] ?? '';
      response.reference = paymentRef;
      response.message = 'Commande enregistrée. Effectuez le paiement pour confirmer.';
    }
    return response;
  }

  async getMyOrders(gamadId: string) {
    return this.repo.findMyOrders(gamadId);
  }
}
