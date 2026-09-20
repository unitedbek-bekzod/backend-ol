import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service.js';
import { UpdateUserStatusDto } from './dto/update-user-status.dto.js';
import { ModerateTemplateDto } from './dto/moderate-template.dto.js';
import { AuthService } from '../auth/auth.service.js';
import { AdminLoginDto } from '../auth/dto/admin-login.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { AdminGuard } from '../../common/guards/admin.guard.js';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly authService: AuthService,
  ) {}

  @Post('auth/login')
  async login(@Body() dto: AdminLoginDto) {
    const { admin, accessToken, refreshToken } = await this.authService.loginAsAdmin(
      dto.phone,
      dto.password,
    );
    return { accessToken, refreshToken, admin: { id: admin.id, phone: admin.phone, name: admin.name } };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('stats')
  stats() {
    return this.adminService.stats();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('users')
  listUsers(@Query('status') status?: string, @Query('q') q?: string) {
    return this.adminService.listUsers(status, q);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('users/:id/status')
  updateUserStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
    return this.adminService.updateUserStatus(id, dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('businesses')
  listBusinesses(@Query('status') status?: string, @Query('q') q?: string) {
    return this.adminService.listBusinesses(status, q);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('templates')
  listTemplates() {
    return this.adminService.listTemplates();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('templates/:id/moderate')
  moderateTemplate(@Param('id') id: string, @Body() dto: ModerateTemplateDto) {
    return this.adminService.moderateTemplate(id, dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('payments')
  listPayments(@Query('from') from?: string, @Query('to') to?: string) {
    return this.adminService.listPayments(from, to);
  }
}
