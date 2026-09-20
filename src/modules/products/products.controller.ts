import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '../../common/types/jwt-payload.type.js';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('businesses/:businessId/products')
  list(@Param('businessId') businessId: string) {
    return this.productsService.listForBusiness(businessId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('businesses/:businessId/products')
  create(
    @CurrentUser() user: JwtPayload,
    @Param('businessId') businessId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.create(businessId, user.sub, dto);
  }

  @Get('products/:id')
  getOne(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('products/:id')
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('products/:id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.productsService.remove(id, user.sub);
  }
}
