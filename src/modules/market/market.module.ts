import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Product } from '../../models/product.model.js';
import { Template } from '../../models/template.model.js';
import { MarketService } from './market.service.js';
import { MarketController } from './market.controller.js';

@Module({
  imports: [SequelizeModule.forFeature([Product, Template])],
  controllers: [MarketController],
  providers: [MarketService],
})
export class MarketModule {}
