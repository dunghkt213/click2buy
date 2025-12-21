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
async getAllOrderForSaller(
  @Payload() data: any,         // nhận auth + status
  @CurrentUser() user: any
) {
  const ownerId = user?.sub || user?.id;
  const status = data?.status || null;   // lấy status từ payload

  return this.appService.getAllOrderForSaller(ownerId, status);
}


 @MessagePattern('order.getAllOrderForUser')
@UseGuards(JwtKafkaAuthGuard)
async getAllOrderForUser(
  @Payload() data: any,         // lấy payload từ Kafka
  @CurrentUser() user: any
) {
  const userId = user?.sub || user?.id;
  const status = data?.status || null;   // lấy status

  return this.appService.getAllOrderForUser(userId, status);
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
  @MessagePattern('payment.failed')
  async handlePaymentFailed(@Payload() data: any) {
    return this.appService.updateOrderStatus_paymentFailed(data);
  }

  @MessagePattern('order.confirm')
  @UseGuards(JwtKafkaAuthGuard)
  async confirmOrder(@Payload() data: { orderId: string }, @CurrentUser() user: any) {
    console.log('order.confirm payload:', data);
    const sellerId = user?.sub || user?.id;
    if (!sellerId) {
      console.error('❌ [Controller] sellerId is missing');
      throw new BadRequestException('Invalid seller');
    }
    try {
      console.log('🔥 [Controller] BEFORE calling service.confirmOrder');
  
      const result = await this.appService.confirmOrder(
        data.orderId,
        sellerId,
      );
  
      console.log('🔥 [Controller] AFTER calling service.confirmOrder', result);
  
      return result;
    } catch (err) {
      console.error(
        '❌ [Controller] ERROR when calling service.confirmOrder',
        {
          message: err?.message,
          stack: err?.stack,
          name: err?.name,
        },
      );
  
      // ⚠️ QUAN TRỌNG: với Kafka RPC, nên throw lại nguyên lỗi
      throw err;
    }
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

  @MessagePattern('order.cancel_request')
  @UseGuards(JwtKafkaAuthGuard)
  async cancelOrder(
    @Payload() data: { orderId: string},
    @CurrentUser() user: any,
  ) {
    const   userId = user?.sub || user?.id;
    return this.appService.cancelOrder(data.orderId, userId);
  }

  @MessagePattern('order.reject.cancel_request')
  @UseGuards(JwtKafkaAuthGuard)
  async RejectCancelOrder(
    @Payload() data: { orderId: string},
    @CurrentUser() user: any,
  ) {
    const   sellerId = user?.sub || user?.id;
    return this.appService.RejectCancelOrder(data.orderId, sellerId);
  }

  @MessagePattern('order.accept.cancel_request')
  @UseGuards(JwtKafkaAuthGuard)
  async AcceptCancelOrder(
    @Payload() data: { orderId: string},
    @CurrentUser() user: any,
  ) {
    const   sellerId = user?.sub || user?.id;
    return this.appService.AcceptCancelOrder(data.orderId, sellerId);
  }
}
