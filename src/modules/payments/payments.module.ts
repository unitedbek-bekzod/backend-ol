import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Transaction } from '../../models/transaction.model.js';
import { Product } from '../../models/product.model.js';
import { Business } from '../../models/business.model.js';
import { PaymentsService } from './payments.service.js';
import { PaymentsController } from './payments.controller.js';

@Module({
  imports: [SequelizeModule.forFeature([Transaction, Product, Business])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
