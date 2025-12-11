import { Controller, Sse, Req, UseGuards, Header } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SseService } from './sse.service';
import { map } from 'rxjs/operators';

@Controller('sse')
export class SseController {
  constructor(
    private readonly sseService: SseService,
    private readonly jwt: JwtService
  ) {}

@Sse('payments')
@Header('Access-Control-Allow-Credentials', 'true')
@Header('Cache-Control', 'no-store')
  stream(@Req() req) {
    console.log('📡 SSE Request received');
    console.log('📡 Cookies:', req.cookies);
    console.log('📡 Headers keys:', Object.keys(req.headers));

    // Get token from cookie
    const token = req.cookies?.['click2buy:accessToken'];

    if (!token) {
      console.log('📡 SSE Error: No token found in cookies');
      throw new Error("Missing token in cookies");
    }

    console.log('📡 Token found in cookie, preview:', token.substring(0, 20) + '...');

    try {
      const decoded = this.jwt.verify(token);
      const userId = decoded.sub || decoded.userId;
      console.log('📡 JWT decoded successfully');
      console.log('📡 User ID from JWT:', userId);

      return this.sseService.subscribe(userId).pipe(
        map((event) => ({ data: event })),
      );
    } catch (error) {
      console.log('📡 SSE Error: JWT verification failed:', error.message);
      throw new Error(`Invalid token: ${error.message}`);
    }
  }
}
