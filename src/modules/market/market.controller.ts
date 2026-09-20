import { Controller, Get, Query } from '@nestjs/common';
import { MarketService } from './market.service.js';

@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get('products')
  products(@Query('category') category?: string, @Query('price') price?: string, @Query('q') q?: string) {
    return this.marketService.searchProducts(category, price, q);
  }

  @Get('templates')
  templates(
    @Query('category') category?: string,
    @Query('price') price?: string,
    @Query('ai_compatible') aiCompatible?: string,
  ) {
    return this.marketService.searchTemplates(category, price, aiCompatible);
  }

  @Get('featured')
  featured() {
    return this.marketService.featured();
  }
}
