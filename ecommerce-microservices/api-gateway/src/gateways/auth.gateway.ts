import { BadRequestException, Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common/decorators/core/inject.decorator';
import { LoginDto } from 'src/dtos/login.dto';
import { RegisterDto } from 'src/dtos/register.dto';
import { SendOtpDto, VerifyOtpDto } from 'src/dtos/sms-login.dto';
import { GoogleAuthGuard } from 'src/auth/guards/google-auth.guard';
import { FacebookAuthGuard } from 'src/auth/guards/facebook-auth.guard';
import type { Response, Request } from 'express';

// Extend Express Request để include user từ Passport
interface RequestWithUser extends Request {
  user?: {
    provider: string;
    socialId: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}

@Controller('auth')
export class AuthGateway {
  constructor(@Inject('KAFKA_SERVICE') private readonly kafka: ClientKafka) { }

  async onModuleInit() {
    this.kafka.subscribeToResponseOf('auth.login');
    this.kafka.subscribeToResponseOf('auth.register');
    this.kafka.subscribeToResponseOf('auth.refresh');
    this.kafka.subscribeToResponseOf('auth.logout');
    this.kafka.subscribeToResponseOf('auth.social-login');
    this.kafka.subscribeToResponseOf('auth.send-otp');
    this.kafka.subscribeToResponseOf('auth.verify-otp');
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

// ==================== GOOGLE OAUTH2 ====================

@Get('google')
@UseGuards(GoogleAuthGuard)
async googleAuth() {
  // Guard sẽ redirect đến Google
}

@Get('google/callback')
@UseGuards(GoogleAuthGuard)
async googleAuthCallback(
  @Req() req: RequestWithUser,
  @Res({ passthrough: true }) res: Response,
) {
  const socialProfile = req.user;
  
  if (!socialProfile) {
    throw new UnauthorizedException('Google authentication failed');
  }
  
  const result = await this.kafka
    .send('auth.social-login', {
      provider: 'google',
      socialId: socialProfile.socialId,
      email: socialProfile.email,
      firstName: socialProfile.firstName,
      lastName: socialProfile.lastName,
      avatar: socialProfile.avatar,
    })
    .toPromise();

  if (!result.success) {
    throw new BadRequestException(result.message || 'Google login failed');
  }

  const { user, accessToken, refreshTokenInfo } = result.data;

  res.cookie('refresh_token', refreshTokenInfo.value, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: refreshTokenInfo.options.maxAge,
  });

  // Redirect về frontend với token
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  return res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}`);
}

// ==================== FACEBOOK OAUTH2 ====================

@Get('facebook')
@UseGuards(FacebookAuthGuard)
async facebookAuth() {
  // Guard sẽ redirect đến Facebook
}

@Get('facebook/callback')
@UseGuards(FacebookAuthGuard)
async facebookAuthCallback(
  @Req() req: RequestWithUser,
  @Res({ passthrough: true }) res: Response,
) {
  const socialProfile = req.user;
  
  if (!socialProfile) {
    throw new UnauthorizedException('Facebook authentication failed');
  }
  
  const result = await this.kafka
    .send('auth.social-login', {
      provider: 'facebook',
      socialId: socialProfile.socialId,
      email: socialProfile.email,
      firstName: socialProfile.firstName,
      lastName: socialProfile.lastName,
      avatar: socialProfile.avatar,
    })
    .toPromise();

  if (!result.success) {
    throw new BadRequestException(result.message || 'Facebook login failed');
  }

  const { user, accessToken, refreshTokenInfo } = result.data;

  res.cookie('refresh_token', refreshTokenInfo.value, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: refreshTokenInfo.options.maxAge,
  });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  return res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}`);
}

// ==================== SMS OTP LOGIN ====================

@Post('login-sms')
async sendOtp(@Body() dto: SendOtpDto) {
  const result = await this.kafka.send('auth.send-otp', dto).toPromise();

  if (!result.success) {
    throw new BadRequestException(result.message || 'Failed to send OTP');
  }

  return {
    success: true,
    message: 'OTP sent successfully',
    // Trong môi trường dev, có thể trả về OTP để test
    ...(process.env.NODE_ENV === 'development' && { otp: result.data?.otp }),
  };
}

@Post('verify-sms')
async verifyOtp(
  @Body() dto: VerifyOtpDto,
  @Res({ passthrough: true }) res: Response,
) {
  const result = await this.kafka.send('auth.verify-otp', dto).toPromise();

  if (!result.success) {
    throw new UnauthorizedException(result.message || 'Invalid OTP');
  }

  const { user, accessToken, refreshTokenInfo } = result.data;

  res.cookie('refresh_token', refreshTokenInfo.value, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: refreshTokenInfo.options.maxAge,
  });

  return {
    message: 'SMS login successful',
    user,
    accessToken,
  };
}

}

