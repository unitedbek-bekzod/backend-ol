import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AiService } from './ai.service.js';
import { CustomizeDto } from './dto/customize.dto.js';
import { RegenerateDto } from './dto/regenerate.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '../../common/types/jwt-payload.type.js';

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('templates/:id/customize')
  customize(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: CustomizeDto) {
    return this.aiService.customize(id, user.sub, dto);
  }

  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('templates/:id/regenerate')
  regenerate(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: RegenerateDto) {
    return this.aiService.regenerate(id, user.sub, dto);
  }

  @Get('usage')
  usage(@CurrentUser() user: JwtPayload) {
    return this.aiService.usage(user.sub);
  }
}
