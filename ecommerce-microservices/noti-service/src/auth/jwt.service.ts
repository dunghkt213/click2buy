import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  private readonly secret = process.env.JWT_SECRET || 'secret_key';

  validateToken(token: string) {
    try {
      const payload = jwt.verify(token, this.secret);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  decodeToken(token: string) {
    try {
      return jwt.decode(token);
    } catch {
      throw new UnauthorizedException('Cannot decode token');
    }
  }
}
