import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthService } from './jwt-auth.service';

/**
 * JWT Authentication Guard
 * Validates JWT token from Authorization header
 * Extracts userId and attaches it to request object
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtAuthService: JwtAuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization header');
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader;

    if (!token) {
      throw new UnauthorizedException('Invalid authorization format');
    }

    try {
      // Validate and decode token
      const payload = this.jwtAuthService.validateToken(token);
      
      // Attach user info to request
      // Handle different possible userId field names from auth-service
      request.user = {
        userId: payload.userId || payload.id || payload.sub,
        email: payload.email,
        ...payload,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
