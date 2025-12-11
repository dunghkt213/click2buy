import { Controller, UseGuards, BadRequestException} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { AppService } from './app.service';
import { Model } from 'mongoose';
import { Order } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-status.dto';
import { JwtKafkaAuthGuard } from './auth/jwt-kafka.guard';
import { CurrentUser } from './auth/current-user.decorator';
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) {}


@MessagePattern('order.create')
@UseGuards(JwtKafkaAuthGuard)
async createOrders(@Payload() data: any, @CurrentUser() user: any) {
  const userId = user?.sub || user?.id;
  const { carts, paymentMethod, orderCode } = data;
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
    orderCode,
    paymentMethod,
    carts,
  });
  } catch(err){
    throw new BadRequestException(err.message || 'Service error');
  }
} 

@MessagePattern('order.getAllOrderForSaller')
@UseGuards(JwtKafkaAuthGuard)
async getAllOrderForSaller(@CurrentUser() user: any) {
  const ownerId = user?.sub || user?.id;
  return this.appService.getAllOrderForSaller(ownerId)
} 
@MessagePattern('order.getAllOrderForUser')
@UseGuards(JwtKafkaAuthGuard)
async getAllOrderForUser(@CurrentUser() user: any) {
  const userId = user?.sub || user?.id;
  return this.appService.getAllOrderForUser(userId)
} 

@MessagePattern('order.timeout')
timeout(@Payload() data: any) {
  console.log('Order timeout received in order-service:', data);
  return true
}

@MessagePattern('payment.success')
async updateOrderStatus(@Payload() data:any) {
  return this.appService.updateOrderStatus_paymentSuccess(data)
} 
// order.app.controller.ts
@MessagePattern('order.payment.banking.requested')
@UseGuards(JwtKafkaAuthGuard)
async handlePaymentBankingRequested(@Payload() data: any, @CurrentUser() user: any) {
  console.log('Received banking payment request for orders:', data);
  const userId = user?.sub || user?.id;
  const {  orderIds } = data;
  return this.appService.requestBankingForOrders({ userId, orderIds });
}


@MessagePattern('order.confirm')
@UseGuards(JwtKafkaAuthGuard)
async confirmOrder(@Payload() data: { orderId: string }, @CurrentUser() user: any) {
  const sellerId = user?.sub || user?.id;
  return this.appService.confirmOrder(data.orderId, sellerId);
}

@MessagePattern('order.reject')
@UseGuards(JwtKafkaAuthGuard)
async rejectOrder(
  @Payload() data: { orderId: string; reason?: string },
  @CurrentUser() user: any,
) {
  const sellerId = user?.sub || user?.id;
  return this.appService.rejectOrder(data.orderId, sellerId, data.reason);
}

@MessagePattern('order.complete')
@UseGuards(JwtKafkaAuthGuard)
async completeOrder(@Payload() data: { orderId: string }, @CurrentUser() user: any) {
  const sellerId = user?.sub || user?.id;
  return this.appService.completeOrder(data.orderId, sellerId);
}
}
