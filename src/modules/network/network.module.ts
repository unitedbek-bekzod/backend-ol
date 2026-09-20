import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { Contact } from '../../models/contact.model.js';
import { NetworkGroup } from '../../models/network-group.model.js';
import { GroupMember } from '../../models/group-member.model.js';
import { Message } from '../../models/message.model.js';
import { User } from '../../models/user.model.js';
import { NetworkService } from './network.service.js';
import { NetworkController } from './network.controller.js';
import { NetworkGateway } from './network.gateway.js';

@Module({
  imports: [
    SequelizeModule.forFeature([Contact, NetworkGroup, GroupMember, Message, User]),
    ConfigModule,
    JwtModule.register({}),
  ],
  controllers: [NetworkController],
  providers: [NetworkService, NetworkGateway],
})
export class NetworkModule {}
