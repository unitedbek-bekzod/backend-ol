import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Transaction } from '../../models/transaction.model.js';
import { Product } from '../../models/product.model.js';
import { Business } from '../../models/business.model.js';
import { CheckoutDto } from './dto/checkout.dto.js';
import { PayoutDto } from './dto/payout.dto.js';

const PLATFORM_COMMISSION_RATE = 0.1;

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger('PaymentsWebhook');

  constructor(
    @InjectModel(Transaction) private readonly transactionModel: typeof Transaction,
    @InjectModel(Product) private readonly productModel: typeof Product,
    @InjectModel(Business) private readonly businessModel: typeof Business,
  ) {}

  // Demo payment gateway: no real provider is integrated, so checkout resolves
  // synchronously as `success` instead of round-tripping through a redirect/webhook.
  async checkout(userId: string, dto: CheckoutDto): Promise<Transaction> {
    let toBusinessId: string | null = null;
    let toTemplateId: string | null = null;
    let amount = dto.amount ?? 0;

    if (dto.targetType === 'product') {
      const product = await this.productModel.findByPk(dto.targetId);
      if (!product) throw new NotFoundException('Product not found');
      toBusinessId = product.businessId;
      amount = Number(product.price);
    } else {
      toTemplateId = dto.targetId;
    }

    const commission = Number((amount * PLATFORM_COMMISSION_RATE).toFixed(2));

    return this.transactionModel.create({
      fromUserId: userId,
      toBusinessId,
      toTemplateId,
      amount,
      commission,
      type: dto.targetType === 'product' ? 'product_purchase' : 'template_purchase',
      status: 'success',
    } as any);
  }

  handleWebhook(payload: unknown): { received: true } {
    this.logger.log(`Webhook payload received: ${JSON.stringify(payload)}`);
    return { received: true };
  }

  async businessTransactions(businessId: string, ownerId: string, from?: string, to?: string): Promise<Transaction[]> {
    const business = await this.businessModel.findByPk(businessId);
    if (!business) throw new NotFoundException('Business not found');
    if (business.ownerId !== ownerId) throw new ForbiddenException('Not your business');

    const where: Record<string | symbol, unknown> = { toBusinessId: businessId };
    if (from || to) {
      where.createdAt = {
        ...(from ? { [Op.gte]: new Date(from) } : {}),
        ...(to ? { [Op.lte]: new Date(to) } : {}),
      };
    }

    return this.transactionModel.findAll({ where, order: [['createdAt', 'DESC']] });
  }

  async requestPayout(ownerId: string, dto: PayoutDto): Promise<Transaction> {
    const business = await this.businessModel.findByPk(dto.businessId);
    if (!business) throw new NotFoundException('Business not found');
    if (business.ownerId !== ownerId) throw new ForbiddenException('Not your business');

    return this.transactionModel.create({
      fromUserId: ownerId,
      toBusinessId: business.id,
      amount: dto.amount,
      commission: 0,
      type: 'payout',
      status: 'pending',
    } as any);
  }
}
