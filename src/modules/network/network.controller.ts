import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { NetworkService } from './network.service.js';
import { NetworkGateway } from './network.gateway.js';
import { CreateGroupDto } from './dto/create-group.dto.js';
import { SendMessageDto } from './dto/send-message.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '../../common/types/jwt-payload.type.js';

@UseGuards(JwtAuthGuard)
@Controller('network')
export class NetworkController {
  constructor(
    private readonly networkService: NetworkService,
    private readonly networkGateway: NetworkGateway,
  ) {}

  @Get('contacts')
  contacts(@CurrentUser() user: JwtPayload) {
    return this.networkService.listContacts(user.sub);
  }

  @Get('groups')
  groups(@CurrentUser() user: JwtPayload) {
    return this.networkService.listGroups(user.sub);
  }

  @Post('groups')
  createGroup(@CurrentUser() user: JwtPayload, @Body() dto: CreateGroupDto) {
    return this.networkService.createGroup(user.sub, dto);
  }

  @Get('groups/:id/messages')
  messages(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.networkService.listMessages(id, user.sub);
  }

  @Post('groups/:id/messages')
  async sendMessage(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: SendMessageDto) {
    const message = await this.networkService.sendMessage(id, user.sub, dto.content);
    this.networkGateway.broadcastMessage(id, message);
    return message;
  }
}
