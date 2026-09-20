import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../../models/user.model.js';
import { Follow } from '../../models/follow.model.js';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';

@Module({
  imports: [SequelizeModule.forFeature([User, Follow])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
