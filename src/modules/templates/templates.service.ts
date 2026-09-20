import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Template } from '../../models/template.model.js';
import { TemplatePurchase } from '../../models/template-purchase.model.js';
import { Transaction } from '../../models/transaction.model.js';
import { CreateTemplateDto } from './dto/create-template.dto.js';
import { UpdateTemplateDto } from './dto/update-template.dto.js';

const PLATFORM_COMMISSION_RATE = 0.15;

@Injectable()
export class TemplatesService {
  constructor(
    @InjectModel(Template) private readonly templateModel: typeof Template,
    @InjectModel(TemplatePurchase) private readonly purchaseModel: typeof TemplatePurchase,
    @InjectModel(Transaction) private readonly transactionModel: typeof Transaction,
  ) {}

  async findById(id: string): Promise<Template> {
    const template = await this.templateModel.findByPk(id);
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async findPurchasedByUser(userId: string): Promise<Template[]> {
    const purchases = await this.purchaseModel.findAll({
      where: { userId },
      include: [{ model: Template }],
      order: [['createdAt', 'DESC']],
    });
    return purchases.map((p: any) => p.template).filter(Boolean);
  }

  async create(authorId: string, dto: CreateTemplateDto): Promise<Template> {
    return this.templateModel.create({
      authorId,
      ...dto,
      status: 'approved',
    } as any);
  }

  async update(id: string, authorId: string, dto: UpdateTemplateDto): Promise<Template> {
    const template = await this.findById(id);
    if (template.authorId !== authorId) throw new ForbiddenException('Not your template');
    Object.assign(template, dto);
    await template.save();
    return template;
  }

  async remove(id: string, authorId: string): Promise<void> {
    const template = await this.findById(id);
    if (template.authorId !== authorId) throw new ForbiddenException('Not your template');
    await template.destroy();
  }

  async purchase(id: string, userId: string): Promise<{ transaction: Transaction; purchase: TemplatePurchase }> {
    const template = await this.findById(id);
    const price = Number(template.price);
    if (price <= 0) {
      throw new ConflictException('Template is free, use it directly');
    }

    const existing = await this.purchaseModel.findOne({ where: { userId, templateId: id } });
    if (existing) throw new ConflictException('Template already purchased');

    const commission = Number((price * PLATFORM_COMMISSION_RATE).toFixed(2));
    const transaction = await this.transactionModel.create({
      fromUserId: userId,
      toTemplateId: id,
      amount: price,
      commission,
      type: 'template_purchase',
      status: 'success',
    } as any);

    const purchase = await this.purchaseModel.create({
      userId,
      templateId: id,
      transactionId: transaction.id,
    } as any);

    return { transaction, purchase };
  }

  async hasAccess(templateId: string, userId: string): Promise<boolean> {
    const template = await this.findById(templateId);
    if (Number(template.price) <= 0) return true;
    if (template.authorId === userId) return true;
    const purchase = await this.purchaseModel.findOne({ where: { userId, templateId } });
    return Boolean(purchase);
  }
}
