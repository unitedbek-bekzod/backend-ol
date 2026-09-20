import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { ProgrammistProfileDto } from './dto/programmist-profile.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '../../common/types/jwt-payload.type.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: JwtPayload) {
    return this.usersService.findById(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/programmist-profile')
  updateProgrammistProfile(@CurrentUser() user: JwtPayload, @Body() dto: ProgrammistProfileDto) {
    return this.usersService.updateProgrammistProfile(user.sub, dto);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/follow')
  follow(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.usersService.follow(user.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/follow')
  unfollow(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.usersService.unfollow(user.sub, id);
  }

  @Get(':id/followers')
  listFollowers(@Param('id') id: string) {
    return this.usersService.listFollowers(id);
  }
}
