import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Template } from '../../models/template.model.js';
import { TemplatePurchase } from '../../models/template-purchase.model.js';
import { Transaction } from '../../models/transaction.model.js';
import { TemplatesService } from './templates.service.js';
import { TemplatesController } from './templates.controller.js';

@Module({
  imports: [SequelizeModule.forFeature([Template, TemplatePurchase, Transaction])],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
