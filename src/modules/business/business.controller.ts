import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { BusinessService } from './business.service.js';
import { CreateBusinessDto } from './dto/create-business.dto.js';
import { UpdateBusinessDto } from './dto/update-business.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '../../common/types/jwt-payload.type.js';

@UseGuards(JwtAuthGuard)
@Controller('businesses')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.businessService.listForOwner(user.sub);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateBusinessDto) {
    return this.businessService.create(user.sub, dto);
  }

  @Get(':id')
  getOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.businessService.findOwned(id, user.sub);
  }

  @Patch(':id')
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateBusinessDto) {
    return this.businessService.update(id, user.sub, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.businessService.remove(id, user.sub);
  }

  @Get(':id/analytics')
  analytics(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.businessService.analytics(id, user.sub);
  }

  @Get(':id/customers')
  customers(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.businessService.customers(id, user.sub);
  }
}
