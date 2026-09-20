import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../../models/user.model.js';
import { Admin } from '../../models/admin.model.js';
import { RefreshToken } from '../../models/refresh-token.model.js';
import { NetworkGroup } from '../../models/network-group.model.js';
import { GroupMember } from '../../models/group-member.model.js';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [
    UsersModule,
    SequelizeModule.forFeature([User, Admin, RefreshToken, NetworkGroup, GroupMember]),
    PassportModule,
    ConfigModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule { }
