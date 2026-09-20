import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { WebsitesService } from './websites.service.js';
import { CreateWebsiteDto } from './dto/create-website.dto.js';
import { UpdateWebsiteDto } from './dto/update-website.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '../../common/types/jwt-payload.type.js';

@UseGuards(JwtAuthGuard)
@Controller('websites')
export class WebsitesController {
  constructor(private readonly websitesService: WebsitesService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateWebsiteDto) {
    return this.websitesService.create(user.sub, dto);
  }

  @Get()
  listAll(@CurrentUser() user: JwtPayload) {
    return this.websitesService.findAllByUser(user.sub);
  }

  @Get(':id')
  getOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.websitesService.findOwned(id, user.sub);
  }

  @Patch(':id')
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateWebsiteDto) {
    return this.websitesService.updateContent(id, user.sub, dto);
  }

  @Post(':id/publish')
  publish(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.websitesService.publish(id, user.sub);
  }
}
