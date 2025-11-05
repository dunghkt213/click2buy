import { Injectable } from '@nestjs/common';
import { JwtSharedService } from './jwt.service';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class JwtSharedStrategy {
  constructor(private readonly jwtService: JwtSharedService) {}

  extractUser(authHeader: string) {
    const payload = this.jwtService.verifyToken(authHeader) as JwtPayload;

    return {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
}
