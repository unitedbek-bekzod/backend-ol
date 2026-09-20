import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Product } from '../../models/product.model.js';
import { Business } from '../../models/business.model.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product) private readonly productModel: typeof Product,
    @InjectModel(Business) private readonly businessModel: typeof Business,
  ) {}

  async listForBusiness(businessId: string): Promise<Product[]> {
    return this.productModel.findAll({ where: { businessId } });
  }

  async create(businessId: string, ownerId: string, dto: CreateProductDto): Promise<Product> {
    await this.assertOwnership(businessId, ownerId);
    return this.productModel.create({ businessId, ...dto } as any);
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productModel.findByPk(id);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, ownerId: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findById(id);
    await this.assertOwnership(product.businessId, ownerId);
    Object.assign(product, dto);
    await product.save();
    return product;
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const product = await this.findById(id);
    await this.assertOwnership(product.businessId, ownerId);
    await product.destroy();
  }

  private async assertOwnership(businessId: string, ownerId: string): Promise<void> {
    const business = await this.businessModel.findByPk(businessId);
    if (!business) throw new NotFoundException('Business not found');
    if (business.ownerId !== ownerId) throw new ForbiddenException('Not your business');
  }
}
