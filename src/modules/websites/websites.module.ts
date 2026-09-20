import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Website } from '../../models/website.model.js';
import { Business } from '../../models/business.model.js';
import { Template } from '../../models/template.model.js';
import { TemplatesModule } from '../templates/templates.module.js';
import { WebsitesService } from './websites.service.js';
import { WebsitesController } from './websites.controller.js';
import { PublicWebsiteController } from './public-website.controller.js';

@Module({
  imports: [SequelizeModule.forFeature([Website, Business, Template]), TemplatesModule],
  controllers: [WebsitesController, PublicWebsiteController],
  providers: [WebsitesService],
})
export class WebsitesModule {}
