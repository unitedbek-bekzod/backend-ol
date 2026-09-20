import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Product } from '../../models/product.model.js';
import { Template } from '../../models/template.model.js';

@Injectable()
export class MarketService {
  constructor(
    @InjectModel(Product) private readonly productModel: typeof Product,
    @InjectModel(Template) private readonly templateModel: typeof Template,
  ) {}

  async searchProducts(category?: string, price?: string, q?: string): Promise<Product[]> {
    const where: Record<symbol, unknown> = {};
    const and: Record<string, unknown>[] = [];

    if (q) {
      and.push({
        [Op.or]: [{ title: { [Op.iLike]: `%${q}%` } }, { description: { [Op.iLike]: `%${q}%` } }],
      });
    }
    if (price === 'free') and.push({ price: 0 });
    if (price === 'paid') and.push({ price: { [Op.gt]: 0 } });
    if (and.length) where[Op.and] = and;

    return this.productModel.findAll({ where, order: [['createdAt', 'DESC']] });
  }

  async searchTemplates(category?: string, price?: string, aiCompatible?: string): Promise<Template[]> {
    const and: Record<string, unknown>[] = [{ status: 'approved' }];

    if (category) and.push({ category });
    if (price === 'free') and.push({ price: 0 });
    if (price === 'paid') and.push({ price: { [Op.gt]: 0 } });
    if (aiCompatible !== undefined) and.push({ aiCompatible: aiCompatible === 'true' });

    return this.templateModel.findAll({ where: { [Op.and]: and }, order: [['createdAt', 'DESC']] });
  }

  async featured(): Promise<{ templates: Template[]; products: Product[] }> {
    const [templates, products] = await Promise.all([
      this.templateModel.findAll({ where: { status: 'approved' }, order: [['createdAt', 'DESC']], limit: 6 }),
      this.productModel.findAll({ order: [['createdAt', 'DESC']], limit: 6 }),
    ]);
    return { templates, products };
  }
}
