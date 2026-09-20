import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Business } from '../../models/business.model.js';
import { Transaction } from '../../models/transaction.model.js';
import { User } from '../../models/user.model.js';
import { BusinessService } from './business.service.js';
import { BusinessController } from './business.controller.js';

@Module({
  imports: [SequelizeModule.forFeature([Business, Transaction, User])],
  controllers: [BusinessController],
  providers: [BusinessService],
  exports: [BusinessService],
})
export class BusinessModule {}
