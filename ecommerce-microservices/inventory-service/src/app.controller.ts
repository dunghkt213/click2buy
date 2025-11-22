// src/app.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('order.created')
  reserveStock(@Payload() data: any) {
    return this.appService.reserveStock(data);
  }

  @MessagePattern('payment.cancelled')
  releaseStock(@Payload() data: any) {
    return this.appService.releaseStock(data);
  }
}
