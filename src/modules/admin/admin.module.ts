import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../../models/user.model.js';
import { Business } from '../../models/business.model.js';
import { Template } from '../../models/template.model.js';
import { Transaction } from '../../models/transaction.model.js';
import { AiUsageLog } from '../../models/ai-usage-log.model.js';
import { AuthModule } from '../auth/auth.module.js';
import { AdminService } from './admin.service.js';
import { AdminController } from './admin.controller.js';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Business, Template, Transaction, AiUsageLog]),
    AuthModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
