import { Controller, UseGuards, BadRequestException } from '@nestjs/common';
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
  ) { console.log('AppController initialized'); }


  @MessagePattern('order.create')
  @UseGuards(JwtKafkaAuthGuard)
  async createOrders(@Payload() data: CreateOrderDto, @CurrentUser() user: any) {
    const userId = user?.sub || user?.id;
    console.log('controller order.create', data)
    if (!userId) {
      throw new BadRequestException('Invalid user');
    }

    try {
      data.userId = userId;
      console.log('controller order.create DTO:', data);
      return this.appService.createOrders(data);
    } catch (err) {
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
  async updateOrderStatus(@Payload() data: any) {
    return this.appService.updateOrderStatus_paymentSuccess(data)
  }

  @MessagePattern('order.payment.banking.requested')
  @UseGuards(JwtKafkaAuthGuard)
  async handlePaymentBankingRequested(
    @Payload() data: any,
    @CurrentUser() user: any,
  ) {
    console.log('✅ RECEIVED order.payment.banking.requested', data);

    const userId = user?.sub || user?.id;
    const { orderCode } = data;

    if (!orderCode) {
      throw new BadRequestException('orderCode is required');
    }

    return this.appService.requestBankingForOrders({
      userId,
      orderCode,
    });
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
