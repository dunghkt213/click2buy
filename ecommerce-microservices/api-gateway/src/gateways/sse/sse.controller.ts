import { Controller, Sse, Req } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SseService } from './sse.service';
import { map } from 'rxjs/operators';

@Controller('sse')
export class SseController {
  constructor(
    private readonly sseService: SseService,
    private readonly jwt: JwtService
  ) {}

  @Sse('payments/me')
  stream(@Req() req) {
    const token = req.cookies?.access_token;  // lấy cookie
    const { sub: userId } = this.jwt.verify(token);

    console.log('📡 SSE Connected via cookie → userId:', userId);

    return this.sseService.subscribe(userId).pipe(
      map((data) => ({ data })),
    );
  }
}
