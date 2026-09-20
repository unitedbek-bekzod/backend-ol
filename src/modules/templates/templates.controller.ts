import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { TemplatesService } from './templates.service.js';
import { CreateTemplateDto } from './dto/create-template.dto.js';
import { UpdateTemplateDto } from './dto/update-template.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '../../common/types/jwt-payload.type.js';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @UseGuards(JwtAuthGuard)
  @Get('my/purchases')
  myPurchases(@CurrentUser() user: JwtPayload) {
    return this.templatesService.findPurchasedByUser(user.sub);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.templatesService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateTemplateDto) {
    return this.templatesService.create(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    return this.templatesService.update(id, user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.templatesService.remove(id, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/purchase')
  purchase(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.templatesService.purchase(id, user.sub);
  }
}
