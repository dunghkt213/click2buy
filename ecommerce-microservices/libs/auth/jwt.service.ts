import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from './jwt-payload.interface';
@Injectable()
export class JwtSharedService {
  verifyToken(authHeader: string) {
    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization token');
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid token format');
    }

    try {
      return jwt.verify(token, process.env.ACCESS_SECRET!) as JwtPayload;
    } catch (err) {
      throw new UnauthorizedException('Token invalid or expired');
    }
  }
}
