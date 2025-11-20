import { Controller, UnauthorizedException, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import {registerDto} from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('auth.register')
  async handleRegister(
    @Payload()
    data: registerDto,
  ) {
      try {
        const result = await this.appService.registerUser(data);
        return {
        success: true,
        message: 'User registered successfully',
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshTokenInfo: result.refreshTokenInfo,
        }
      };
      } catch (err) {
        return { success: false, message: err.message };
      }
  }

  @MessagePattern('auth.login')
  async handleLogin(
    @Payload() message: LoginDto,
  ) {
    try {
      const result = await this.appService.login(message);
      return {
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshTokenInfo: result.refreshTokenInfo,
        },
      };
    } catch (err) {
      return { success: false, error: err.message, message: err.message };
    }
  }

  @MessagePattern('auth.logout')
  async handleLogout(@Payload() message: { refreshToken: string }) {
    try {
      await this.appService.revoke(message.refreshToken);
      return {
        success: true,
        message: 'Logout successful',
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  @MessagePattern('auth.refresh')
  async handleRefresh(@Payload() message: { refreshToken: string }) {
    try {
      const result = await this.appService.refreshAccessToken(
        message.refreshToken
  );

      return {
        success: true,
        message: 'Access token refreshed',
        data: {
          accessToken: result.accessToken,
          refreshTokenInfo: result.refreshTokenInfo,
        },
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  @MessagePattern('auth.verify')
  async handleVerify(@Payload() message: { token: string }) {
    const payload = this.appService.verifyAccessToken(message.token);
    if (!payload) {
      return { success: false, error: 'Invalid or expired access token' };
    }
    return {
      success: true,
      data: {
        user: {
          id: payload['sub'],
          username: payload['username'] || 'unknown',
        },
      },
    };
  }

  @MessagePattern('auth.revoke')
  async handleRevoke(@Payload() message: { refreshToken: string }) {
    await this.appService.revoke(message.refreshToken);
    return { success: true, message: 'Refresh token revoked' };
  }
}
