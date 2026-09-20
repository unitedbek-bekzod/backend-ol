import { Controller, Get, Param } from '@nestjs/common';
import { WebsitesService } from './websites.service.js';

@Controller('w')
export class PublicWebsiteController {
  constructor(private readonly websitesService: WebsitesService) {}

  @Get(':slug')
  getPublic(@Param('slug') slug: string) {
    return this.websitesService.getPublic(slug);
  }
}
