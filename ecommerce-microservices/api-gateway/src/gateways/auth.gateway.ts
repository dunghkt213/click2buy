import { BadRequestException, Body, Controller, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common/decorators/core/inject.decorator';
import { LoginDto } from 'src/dtos/login.dto';
import { RegisterDto } from 'src/dtos/register.dto';
import type { Response,Request } from 'express';
@Controller('auth')
export class AuthGateway {
  constructor(@Inject('KAFKA_SERVICE') private readonly kafka: ClientKafka) { }

  async onModuleInit() {
    this.kafka.subscribeToResponseOf('auth.login');
    this.kafka.subscribeToResponseOf('auth.register');
    this.kafka.subscribeToResponseOf('auth.refresh');
    this.kafka.subscribeToResponseOf('auth.logout');
    await this.kafka.connect();
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.kafka.send('auth.login', dto).toPromise();
    if (!result.success) {
        throw new BadRequestException(result.message || 'Login failed');
      }
    const { user, accessToken, refreshTokenInfo } = result.data;

  // 👇 Set cookie refresh_token (rotation-ready)
  res.cookie('refresh_token', refreshTokenInfo.value, {
    httpOnly: true,
    secure: false,   // true khi dùng HTTPS
    sameSite: 'lax',
    path: '/',
    maxAge: refreshTokenInfo.options.maxAge,
  });
  return {
    message: 'login successful',
    user,
    accessToken,
  };
}


@Post('register')
async register(
  @Body() dto: RegisterDto,
  @Res({ passthrough: true }) res: Response,
) {

  // Gửi sang auth-service qua Kafka
  const result = await this.kafka.send('auth.register', dto).toPromise();

  if (!result.success) {
    throw new BadRequestException(result.message || 'Register failed');
  }

  const { user, accessToken, refreshTokenInfo } = result.data;

  // 👇 Set cookie refresh_token (rotation-ready)
  res.cookie('refresh_token', refreshTokenInfo.value, {
    httpOnly: true,
    secure: false,   // true khi dùng HTTPS
    sameSite: 'lax',
    path: '/',
    maxAge: refreshTokenInfo.options.maxAge,
  });
  return {
    message: 'Register successful',
    user,
    accessToken,
  };
}

@Post('refresh')
async refresh(
  @Req() req: Request,
  @Res({ passthrough: true }) res: Response,
) {
  // lấy refresh từ cookie
  const refreshToken = req.cookies?.refresh_token;
  if (!refreshToken) {
    throw new UnauthorizedException('Refresh token missing');
  }

  // gửi kafka đến auth-service
  const result = await this.kafka
    .send('auth.refresh', { refreshToken })
    .toPromise();

  if (!result.success) {
    throw new UnauthorizedException(result.error || 'Invalid refresh token');
  }

  const { accessToken, refreshTokenInfo } = result.data;


  res.cookie('refresh_token', refreshTokenInfo.value, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: refreshTokenInfo.options.maxAge,
  });

  return {
    message: 'Access token refreshed',
    accessToken,
  };
}

@Post('logout')
async logout(
  @Req() req: Request,
  @Res({ passthrough: true }) res: Response,
) {
  const refreshToken = req.cookies?.refresh_token;

  if (!refreshToken) {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
    });
    return { success: true, message: 'Logged out (no token found)' }; 
  }

  const result = await this.kafka
    .send('auth.logout', { refreshToken })
    .toPromise();

  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
  });

  if (result.success) {
    return { success: true, message: 'Logged out successfully' }; 
  } else {
    return { success: false, message: result.error }; 
  }
}



}
