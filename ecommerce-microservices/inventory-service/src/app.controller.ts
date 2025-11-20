// src/app.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('product.created')
  handleProductCreated(@Payload() data: any) {
    return this.appService.onProductCreated(data);
  }

  @MessagePattern('order.created')
  reserveStock(@Payload() data: any) {
    return this.appService.reserveStock(data);
  }

  @MessagePattern('order.paid')
  confirmStock(@Payload() data: any) {
    return this.appService.confirmStock(data);
  }

  @MessagePattern('order.cancelled')
  releaseStock(@Payload() data: any) {
    return this.appService.releaseStock(data);
  }

  @MessagePattern('order.cancel.approved')
  releaseStockApproved(@Payload() data: any) {
    return this.appService.releaseStock(data);
  }
}
