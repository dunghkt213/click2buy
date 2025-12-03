import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from './jwt.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader;

    if (!token) {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    let payload: any;
    try {
      payload = this.jwtService.validateToken(token);
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Hỗ trợ cả sub (JWT standard) và userId (custom)
    const userId = payload.sub || payload.userId || payload.id;
    if (!payload || !userId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Normalize user object để @CurrentUser luôn có sub
    request.user = {
      ...payload,
      sub: userId,
      id: userId,
    };

    return true;
  }
}
