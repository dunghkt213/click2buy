import {
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { TokenService } from './token/token.service';
import { OtpService } from './otp/otp.service';
import { registerDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SocialLoginDto, SocialProvider } from './dto/social-login.dto';

@Injectable()
export class AppService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly otpService: OtpService,

    @Inject('AUTH_SERVICE')
    private readonly AuthClient: ClientKafka,
  ) {}

  async onModuleInit() {
    // cần để send().toPromise() hoạt động
    this.AuthClient.subscribeToResponseOf('user.create');
    this.AuthClient.subscribeToResponseOf('user.getByforpasswordHash');
    this.AuthClient.subscribeToResponseOf('user.findOrCreateSocial');
    this.AuthClient.subscribeToResponseOf('user.findOrCreateByPhone');
  }


  async validateUser(dto: LoginDto) {
    console.log('🔍 Validating user via user-service:', { field: 'username', value: dto.username });

    const user = await this.AuthClient
      .send('user.getByforpasswordHash', { username: dto.username })
      .toPromise();

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const match = await bcrypt.compare(dto.password, user.passwordHash);
    if (!match) {
      throw new UnauthorizedException('Invalid password');
    }

    return user;
  }


  async generateAccessToken( userRole?: string, userId?: string) {
    const secret = process.env.ACCESS_SECRET;
    if (!secret) throw new Error('ACCESS_SECRET missing');
    
    return jwt.sign(
      { sub: userId, role: userRole },
      secret,
      { expiresIn: process.env.ACCESS_EXPIRES_IN || '100m' as any },
    );
  }


  async generateRefreshToken(userRole?: string, userId?: string) {
    const secret = process.env.REFRESH_SECRET;
    if (!secret) throw new Error('REFRESH_SECRET missing');

  
    const refreshExpiresIn = process.env.REFRESH_EXPIRES_IN || '30d';

      const refreshToken = jwt.sign(
    { sub: userId, role: userRole },
    secret,
    { expiresIn: refreshExpiresIn as any }, 
  );


    const decoded: any = jwt.decode(refreshToken);
    const expMs = decoded?.exp ? decoded.exp * 1000 : Date.now() + 30 * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(expMs);
    if (!userId) {
    throw new UnauthorizedException("Invalid token: missing userId (sub)");
    }

    await this.tokenService.saveToken(userId, refreshToken, expiresAt);

    return refreshToken;
  }

  verifyAccessToken(token: string) {
    try {
      const secret = process.env.ACCESS_SECRET;
      if (!secret) throw new Error('ACCESS_SECRET missing');
      return jwt.verify(token, secret);
    } catch {
      return null;
    }
  }


  async verifyRefreshToken(token: string) {
    try {
      const secret = process.env.REFRESH_SECRET;
      if (!secret) throw new Error('REFRESH_SECRET missing');


      const decoded = jwt.verify(token, secret) as any;

   
      const validInDb = await this.tokenService.isTokenValid(token);
      if (!validInDb) {
        throw new UnauthorizedException(
          'Refresh token revoked or expired in DB',
        );
      }

      return decoded; 
    } catch (err) {
      return null;
    }
  }
async genToken (dto: any) {

    const accessToken = await this.generateAccessToken(dto.userRole, dto.userId);
    const refreshToken = await this.generateRefreshToken(dto.userRole, dto.userId);
    console.log("gen_new_token",accessToken)
    return {
      accessToken: accessToken,
      refreshTokenInfo: {
        name: 'refreshToken',
        value: refreshToken,
        options: {
          httpOnly: true,
          secure: true,
          sameSite: 'strict' as const,
          path: '/auth/refresh',
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
        },
      },
    };
  }
  async login(dto: LoginDto) {
    const user = await this.validateUser(dto);

    const accessToken = await this.generateAccessToken(user.role, user._id);
    const refreshToken = await this.generateRefreshToken(user.role, user._id);
    console.log("access o ham login",accessToken)
    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
      },
      accessToken: accessToken,
      refreshTokenInfo: {
        name: 'refreshToken',
        value: refreshToken,
        options: {
          httpOnly: true,
          secure: true,
          sameSite: 'strict' as const,
          path: '/auth/refresh',
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
        },
      },
    };
  }


  async registerUser(dto: registerDto ) {

    const createdUser = await this.AuthClient
      .send('user.create', dto)
      .toPromise();
    console.log('User registered via auth-service:', createdUser);
    if (!createdUser || (createdUser as any)?.error) {
      throw new UnauthorizedException(
        (createdUser as any)?.error || 'Failed to create user',
      );
    }

    const accessToken = await this.generateAccessToken( 
      createdUser.role,
      createdUser.id
    );
    const refreshToken = await this.generateRefreshToken(
      createdUser.role,
      createdUser.id);
    return {
      user: createdUser,
      accessToken,
      refreshTokenInfo: {
        name: 'refreshToken',
        value: refreshToken,
        options: {
          httpOnly: true,
          secure: true,
          sameSite: 'strict' as const,
          path: '/auth/refresh',
          maxAge: 30 * 24 * 60 * 60 * 1000,
        },
      },
    };
  }


  async refreshAccessToken(refreshToken: string) {
    const decoded = await this.verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const userId =  decoded.sub as string;
    const userRole = decoded.role as string;
    const secret = process.env.ACCESS_SECRET;
    if (!secret) throw new Error('ACCESS_SECRET missing');
    const newAccessToken = jwt.sign(
      { sub: userId, role: userRole },
      secret,
      { expiresIn: process.env.ACCESS_EXPIRES_IN || '5m' as any }
      )
    return {
      accessToken: newAccessToken,
      refreshTokenInfo: {
        name: 'refreshToken',
        value: refreshToken,
        options: {
          httpOnly: true,
          secure: true,
          sameSite: 'strict' as const,
          path: '/auth/refresh',
          maxAge: 30 * 24 * 60 * 60 * 1000,
        },
      },
    };
  }


  async revoke(refreshToken: string) {
    await this.tokenService.revokeToken(refreshToken);
    return { revoked: true };
  }

  // ==================== SOCIAL LOGIN ====================

  async socialLogin(dto: SocialLoginDto) {
    console.log('🔐 Social login attempt:', { provider: dto.provider, socialId: dto.socialId });

    // Gọi User Service để tìm hoặc tạo user
    const user = await this.AuthClient
      .send('user.findOrCreateSocial', {
        provider: dto.provider,
        socialId: dto.socialId,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        avatar: dto.avatar,
      })
      .toPromise();

    if (!user || user.error) {
      throw new UnauthorizedException(user?.error || 'Failed to authenticate with social provider');
    }

    const accessToken = await this.generateAccessToken(user.role, user.id || user._id);
    const refreshToken = await this.generateRefreshToken(user.role, user.id || user._id);

    return {
      user: {
        id: user.id || user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        provider: dto.provider,
      },
      accessToken,
      refreshTokenInfo: {
        name: 'refreshToken',
        value: refreshToken,
        options: {
          httpOnly: true,
          secure: true,
          sameSite: 'strict' as const,
          path: '/auth/refresh',
          maxAge: 30 * 24 * 60 * 60 * 1000,
        },
      },
    };
  }

  // ==================== SMS OTP ====================

  async sendOtp(phone: string) {
    const otp = this.otpService.generateOtp();
    await this.otpService.saveOtp(phone, otp);
    await this.otpService.sendSms(phone, otp);

    console.log(`📱 OTP generated for ${phone}: ${otp}`);

    return { otp }; // Chỉ trả về trong dev mode
  }

  async verifyOtpAndLogin(phone: string, otp: string) {
    const isValid = await this.otpService.verifyOtp(phone, otp);

    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Tìm hoặc tạo user theo số điện thoại
    const user = await this.AuthClient
      .send('user.findOrCreateByPhone', { phone })
      .toPromise();

    if (!user || user.error) {
      throw new UnauthorizedException(user?.error || 'Failed to create user');
    }

    const accessToken = await this.generateAccessToken(user.role, user.id || user._id);
    const refreshToken = await this.generateRefreshToken(user.role, user.id || user._id);

    return {
      user: {
        id: user.id || user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
      },
      accessToken,
      refreshTokenInfo: {
        name: 'refreshToken',
        value: refreshToken,
        options: {
          httpOnly: true,
          secure: true,
          sameSite: 'strict' as const,
          path: '/auth/refresh',
          maxAge: 30 * 24 * 60 * 60 * 1000,
        },
      },
    };
  }
}
