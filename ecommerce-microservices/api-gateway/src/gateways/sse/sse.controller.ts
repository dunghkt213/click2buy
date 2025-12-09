import { Controller, Get, Param, Sse } from '@nestjs/common';
import { SseService } from './sse.service';
import { map } from 'rxjs/operators';

@Controller('sse')
export class SseController {
  constructor(private readonly sseService: SseService) {}

  @Sse('payments/:userId')
  streamPayment(@Param('userId') userId: string) {
    console.log('📡 SSE Connected:', userId);

    return this.sseService.subscribe(userId).pipe(
      map((data) => ({
        data,
      })),
    );
  }
}
