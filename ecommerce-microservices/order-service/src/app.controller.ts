import { Controller, UseGuards, BadRequestException} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-status.dto';
import { JwtKafkaAuthGuard } from './auth/jwt-kafka.guard';
import { CurrentUser } from './auth/current-user.decorator';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}


@MessagePattern('order.create')
@UseGuards(JwtKafkaAuthGuard)
async createOrders(@Payload() data: any, @CurrentUser() user: any) {
  const userId = user?.sub || user?.id;
  const { carts, paymentMethod } = data;
  console.log('controller order.create', carts)
  if (!carts || !Array.isArray(carts)) {
    throw new BadRequestException('Invalid payload: carts[] required');
  }

  if (!paymentMethod) {
    throw new BadRequestException('paymentMethod required');
  }

  try{
    return this.appService.createOrders({
    userId,
    paymentMethod,
    carts,
  });
  } catch(err){
    throw new BadRequestException(err.message || 'Service error');
  }
} 

  @MessagePattern('payment.created')
  updateStatus(@Payload() data: any) {
    return this.appService.updateOrderStatus_success(data);
  }

  @MessagePattern('order.timeout')
  timeout(@Payload() data: any) {
    console.log('Order timeout received in order-service:', data);
    return true
  }
  
}
