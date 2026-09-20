import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Template } from '../../models/template.model.js';
import { Website } from '../../models/website.model.js';
import { Business } from '../../models/business.model.js';
import { AiUsageLog } from '../../models/ai-usage-log.model.js';
import { AiService } from './ai.service.js';
import { AiController } from './ai.controller.js';
import { AnthropicService } from './anthropic.service.js';

@Module({
  imports: [SequelizeModule.forFeature([Template, Website, Business, AiUsageLog]), ConfigModule],
  controllers: [AiController],
  providers: [AiService, AnthropicService],
})
export class AiModule {}
