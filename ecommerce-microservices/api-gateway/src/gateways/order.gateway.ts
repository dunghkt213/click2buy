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
import { firstValueFrom } from 'rxjs';

@Controller('orders')
export class OrderGateway implements OnModuleInit {
  constructor(@Inject('KAFKA_SERVICE') private readonly kafka: ClientKafka) { }

  async onModuleInit() {
    // 1. Đăng ký các topic mà Gateway cần nhận phản hồi
    this.kafka.subscribeToResponseOf('order.create');
    this.kafka.subscribeToResponseOf('order.getAllOrderForSaller');
    this.kafka.subscribeToResponseOf('order.getAllOrderForUser');
    this.kafka.subscribeToResponseOf('order.confirm');
    this.kafka.subscribeToResponseOf('order.reject');
    this.kafka.subscribeToResponseOf('order.complete');
    this.kafka.subscribeToResponseOf('order.cancel_request');
    this.kafka.subscribeToResponseOf('order.cancel_order');
    this.kafka.subscribeToResponseOf('order.reject.cancel_request');
    this.kafka.subscribeToResponseOf('order.accept.cancel_request');
    this.kafka.subscribeToResponseOf('order.reject.cancel_request');
    this.kafka.subscribeToResponseOf('user.batch');
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

  @Patch('seller/:orderId/confirm')
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

  @Patch('seller/:orderId/reject')
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
        .send('order.complete', { orderId, auth }) 
        .toPromise();
    } catch (err) {
      throw new BadRequestException(err.message || 'Complete order failed');
    }
  }
  @Patch(':orderId/cancel_request')
  async cancelOrder(
    @Param('orderId') orderId: string,
    @Headers('authorization') auth: string,
  ) {
    try {
      // Gọi sang order-service để báo đơn hàng đã hoàn tất -> Lúc này mới cộng tiền
      return await this.kafka
        .send('order.cancel_request', { orderId, auth }) 
        .toPromise();
    } catch (err) {
      throw new BadRequestException(err.message || 'Complete order failed');
    }
  }

  @Patch(':orderId/cancel_order')
  async CancelOrderOnPendingPayment(
    @Param('orderId') orderId: string,
    @Headers('authorization') auth: string,
  ) {
    try {
      // Gọi sang order-service để báo đơn hàng đã hoàn tất -> Lúc này mới cộng tiền
      return await this.kafka
        .send('order.cancel_order', { orderId, auth }) 
        .toPromise();
    } catch (err) {
      throw new BadRequestException(err.message || 'Complete order failed');
    }
  }

    @Patch(':orderId/cancel_request.accept')
  async AcceptCancelOrder(
    @Param('orderId') orderId: string,
    @Headers('authorization') auth: string,
  ) {
    try {
      // Gọi sang order-service để báo đơn hàng đã hoàn tất -> Lúc này mới cộng tiền
      return await this.kafka
        .send('order.accept.cancel_request', { orderId, auth }) 
        .toPromise();
    } catch (err) {
      throw new BadRequestException(err.message || 'Complete order failed');
    }
  }

      @Patch(':orderId/cancel_request.reject')
  async RejectCancelOrder(
    @Param('orderId') orderId: string,
    @Headers('authorization') auth: string,
  ) {
    try {
      // Gọi sang order-service để báo đơn hàng đã hoàn tất -> Lúc này mới cộng  tiền
      return await this.kafka
        .send('order.reject.cancel_request', { orderId, auth }) 
        .toPromise();
    } catch (err) {
      throw new BadRequestException(err.message || 'Complete order failed');
    }
  }

@Get('seller')
async getOrder(
  @Headers('authorization') auth?: string,
  @Query('status') status?: string,
) {
  try {
    const orders = await firstValueFrom(
      this.kafka.send('order.getAllOrderForSaller', { auth, status }),
    );

    if (!orders?.length) return [];

    // ===== PRODUCT BATCH =====
    const productIds = orders.flatMap(o => o.items.map(i => i.productId));
    const uniqueProductIds = [...new Set(productIds.map(String))];

    const products = await firstValueFrom(
      this.kafka.send('product.batch', { ids: uniqueProductIds }),
    );

    const productMap: Record<string, any> = {};
    (products || []).forEach(p => {
      productMap[String(p._id)] = {
        name: p.name,
        images: p.images || [],
      };
    });

    // ===== USER BATCH =====
    const userIds = [...new Set(orders.map(o => String(o.userId)))];

    const users = await firstValueFrom(
      this.kafka.send('user.batch', { ids: userIds }),
    );

    const userMap: Record<string, any> = {};
    (users || []).forEach(u => {
      userMap[String(u._id)] = u; // trả về full user (đã remove passwordHash vì schema JSON hidden)
    });

    // ===== RETURN =====
    return orders.map(o => ({
      ...o,
      user: userMap[String(o.userId)] || null,
      items: o.items.map(it => ({
        ...it,
        product: productMap[String(it.productId)] || null,
      })),
    }));
  } catch (err) {
    return new BadRequestException(err.message || 'Service error');
  }
}




@Get('user')
async getOrderForUser(
  @Headers('authorization') auth?: string,
  @Query('status') status?: string,
) {
  try {
    const orders = await firstValueFrom(
      this.kafka.send('order.getAllOrderForUser', { auth, status }),
    );

    if (!orders?.length) return [];

    // ===== PRODUCT BATCH =====
    const productIds = orders.flatMap(o => o.items.map(i => i.productId));
    const uniqueProductIds = [...new Set(productIds.map(String))];

    const products = await firstValueFrom(
      this.kafka.send('product.batch', { ids: uniqueProductIds }),
    );

    const productMap: Record<string, any> = {};
    (products || []).forEach(p => {
      productMap[String(p._id)] = {
        name: p.name,
        images: p.images || [],
      };
    });

    // ===== USER BATCH =====
    const userIds = [...new Set(orders.map(o => String(o.userId)))];

    const users = await firstValueFrom(
      this.kafka.send('user.batch', { ids: userIds }),
    );

    const userMap: Record<string, any> = {};
    (users || []).forEach(u => {
      userMap[String(u._id)] = u;
    });

    // ===== RETURN =====
    return orders.map(o => ({
      ...o,
      user: userMap[String(o.userId)] || null,
      items: o.items.map(it => ({
        ...it,
        product: productMap[String(it.productId)] || null,
      })),
    }));
  } catch (err) {
    return new BadRequestException(err.message || 'Service error');
  }
}


}