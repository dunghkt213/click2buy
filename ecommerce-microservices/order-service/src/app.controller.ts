import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-status.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('order.create')
  createOrder(@Payload() data: CreateOrderDto) {
    return this.appService.createOrder(data);
  }

  @MessagePattern('order.updateStatus')
  updateStatus(@Payload() data: UpdateOrderStatusDto) {
    return this.appService.updateOrderStatus(data);
  }

  @MessagePattern('order.timeout')
  timeout(@Payload() data: any) {
    console.log('Order timeout received in order-service:', data);
    return true
  }
  
}
