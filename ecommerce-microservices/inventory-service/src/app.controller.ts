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
  @MessagePattern('order.success')
  commitStock(@Payload() data: any) {
    return this.appService.commitStock(data);
  }

  @MessagePattern('payment.cancelled')
  releaseStock(@Payload() data: any) {
    return this.appService.releaseStock(data);
  }

  // Khi product tạo → sync lần đầu
  @MessagePattern('inventory.sync.requested')
  async handleProductCreated(@Payload() data: any) {
    return this.appService.createProductStock(data);
  }

  // Product-service hỏi số lượng tồn
  @MessagePattern('inventory.getStock.request')
  async getStock(@Payload() data: { productId: string }) {
    return this.appService.getStock(data.productId);
  }

  // Seller chỉnh sửa stock → product-service gửi qua Kafka
  @MessagePattern('inventory.addStock')
  async addStock(
    @Payload() data: { productId: string; amount: number; ownerId?: string },
  ) {
    return this.appService.addStock(data.productId, data.amount, data.ownerId);
  }

  @MessagePattern('inventory.adjustStock')
  async adjustStock(
    @Payload() data: { productId: string; delta: number; ownerId?: string },
  ) {
    return this.appService.adjustStock(data.productId, data.delta, data.ownerId);
  }

}
