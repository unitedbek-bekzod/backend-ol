import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { GoogleLoginDto } from './dto/google-login.dto.js';
import { AdminLoginDto } from './dto/admin-login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  async googleLogin(@Body() dto: GoogleLoginDto) {
    const { user, accessToken, refreshToken } = await this.authService.loginWithGoogle(dto.idToken);
    return {
      accessToken,
      refreshToken,
      subjectType: 'user' as const,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
    };
  }

  @Post('admin/login')
  async adminLogin(@Body() dto: AdminLoginDto) {
    const { admin, accessToken, refreshToken } = await this.authService.loginAsAdmin(
      dto.phone,
      dto.password,
    );
    return {
      accessToken,
      refreshToken,
      subjectType: 'admin' as const,
      admin: { id: admin.id, phone: admin.phone, name: admin.name },
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() dto: RefreshTokenDto) {
    await this.authService.logout(dto.refreshToken);
    return { success: true };
  }
}
