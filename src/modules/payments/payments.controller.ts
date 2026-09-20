import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import { CheckoutDto } from './dto/checkout.dto.js';
import { PayoutDto } from './dto/payout.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '../../common/types/jwt-payload.type.js';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('payments/checkout')
  checkout(@CurrentUser() user: JwtPayload, @Body() dto: CheckoutDto) {
    return this.paymentsService.checkout(user.sub, dto);
  }

  @Post('payments/webhook')
  webhook(@Body() payload: unknown) {
    return this.paymentsService.handleWebhook(payload);
  }

  @UseGuards(JwtAuthGuard)
  @Get('businesses/:id/transactions')
  businessTransactions(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.paymentsService.businessTransactions(id, user.sub, from, to);
  }

  @UseGuards(JwtAuthGuard)
  @Post('payouts')
  payout(@CurrentUser() user: JwtPayload, @Body() dto: PayoutDto) {
    return this.paymentsService.requestPayout(user.sub, dto);
  }
}
