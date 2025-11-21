import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

/**
 * JWT Service
 * Handles JWT token validation and decoding
 */
@Injectable()
export class JwtAuthService {
  private readonly secret: string;

  constructor(private readonly configService: ConfigService) {
    this.secret = this.configService.get<string>('jwt.secret') || 'your_jwt_secret_here';
  }

  /**
   * Validate and decode JWT token
   * @param token - JWT token string
   * @returns Decoded payload with userId
   */
  validateToken(token: string): any {
    try {
      const payload = jwt.verify(token, this.secret);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Decode token without verification (for testing)
   * @param token - JWT token string
   * @returns Decoded payload
   */
  decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch {
      throw new UnauthorizedException('Cannot decode token');
    }
  }
}
