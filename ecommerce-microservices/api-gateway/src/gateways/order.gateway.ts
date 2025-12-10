import { 
  Body, 
  Controller, 
  Delete, 
  Get, 
  Param, 
  Post, 
  Put, 
  Query, 
  Headers, 
  BadRequestException, 
  Patch, 
  OnModuleInit, 
  Inject 
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Controller('orders')
export class OrderGateway implements OnModuleInit {
  constructor(@Inject('KAFKA_SERVICE') private readonly kafka: ClientKafka) {}

  async onModuleInit() {
    // 1. Đăng ký các topic mà Gateway cần nhận phản hồi
    this.kafka.subscribeToResponseOf('order.create');
    this.kafka.subscribeToResponseOf('order.getAllOrderForSaller');
    this.kafka.subscribeToResponseOf('order.getAllOrderForUser');
    this.kafka.subscribeToResponseOf('order.confirm'); 
    this.kafka.subscribeToResponseOf('order.seller.reject'); 
    this.kafka.subscribeToResponseOf('order.complete');

    await this.kafka.connect();
  }

  @Post()
  create(@Body() dto: any, @Headers('authorization') auth?: string) {
    try {
      return this.kafka.send('order.create', { ...dto, auth });
    } catch (err) {
      return new BadRequestException(err.message || 'Service error');
    }
  }

  @Patch('seller/orders/:orderId/confirm')
  async approveOrderForSeller(
    @Param('orderId') orderId: string,
    @Headers('authorization') auth: string,
  ) {
    try {
      const payload = { orderId, auth };

      // SỬA TÊN TOPIC: từ 'order.seller.approve' -> 'order.confirm'
      return await this.kafka
        .send('order.confirm', payload)
        .toPromise();
        
    } catch (err) {
      throw new BadRequestException(err.message || 'Approve failed');
    }
  }

  @Patch('seller/orders/:orderId/reject')
  async rejectOrderForSeller(
    @Param('orderId') orderId: string,
    @Headers('authorization') auth: string,
  ) {
    try {
      const payload = { orderId, auth };

      return await this.kafka
        .send('order.reject', payload)
        .toPromise();
    } catch (err) {
      throw new BadRequestException(err.message || 'Reject failed');
    }
  }

  // THÊM API NÀY ĐỂ TEST DOANH THU (Giả lập Shipper báo giao xong)
  @Patch(':orderId/complete')
  async completeOrder(
    @Param('orderId') orderId: string,
    @Headers('authorization') auth: string,
  ) {
    try {
      // Gọi sang order-service để báo đơn hàng đã hoàn tất -> Lúc này mới cộng tiền
      return await this.kafka
        .send('order.complete', { orderId, auth }) // Lưu ý: MessagePattern bên Order Service phải là 'order.complete'
        .toPromise();
    } catch (err) {
      throw new BadRequestException(err.message || 'Complete order failed');
    }
  }

  @Get('seller')
  getOrder(@Headers('authorization') auth?: string) {
    try {
      return this.kafka.send('order.getAllOrderForSaller', { auth });
    } catch (err) {
      return new BadRequestException(err.message || 'Service error');
    }
  }

  @Get('user')
  getOrderForUser(@Headers('authorization') auth?: string) {
    try {
      return this.kafka.send('order.getAllOrderForUser', { auth });
    } catch (err) {
      return new BadRequestException(err.message || 'Service error');
    }
  }
}