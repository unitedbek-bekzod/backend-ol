import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Product } from '../../models/product.model.js';
import { Business } from '../../models/business.model.js';
import { ProductsService } from './products.service.js';
import { ProductsController } from './products.controller.js';

@Module({
  imports: [SequelizeModule.forFeature([Product, Business])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
