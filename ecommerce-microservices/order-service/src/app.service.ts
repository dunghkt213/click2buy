import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClientKafka } from '@nestjs/microservices';

import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-status.dto';
import Redis from 'ioredis/built/Redis';
import { timeout } from 'rxjs';
@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @Inject('KAFKA_PRODUCER')
    private readonly kafka: ClientKafka,
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis, 
  ) {}

async onModuleInit() {
  // Các topic RPC API Gateway phải subscribe để nhận response
  this.kafka.subscribeToResponseOf('product.findOne');
  await this.kafka.connect();
}

async getProductInfo(productId: string) {
  return this.kafka
    .send('product.findOne', { id: productId })
    .pipe(timeout(3000)) // optional: tránh treo
    .toPromise();
}


async createOrders(input: {
  userId: string;
  paymentMethod: string;
  carts: {
    cartId: string;
    sellerId: string;
    products: { productId: string; quantity: number }[];
  }[];
}) {
  console.log('=>> service order.create')
  const { userId, paymentMethod, carts } = input;
  const orderIds = [];
  const products= [];
  let totalAllOrders = 0;
  for (const cart of carts) {
    const items = [];

    // ---- 1. Validate + fetch lại giá chính xác từ ProductService ----
    for (const p of cart.products) {
      const product = await this.getProductInfo(p.productId);
      console.log("PRODUCT INFO:", product);
      products.push({
        productId: p.productId,
        quantity: p.quantity,
      })
      if (!product) {
        throw new NotFoundException(`Product not found: ${p.productId}`);
      }

      const finalPrice =
        product.discount && product.discount > 0
          ? product.price - (product.price * product.discount) / 100
          : product.price;
      items.push({
        productId: p.productId,
        quantity: p.quantity,
        price: finalPrice,
      });
    }

    // ---- 2. Tính tổng tiền của cart ----
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // ---- 3. Tạo order ----
    const order = new this.orderModel({
      userId,
      ownerId: cart.sellerId,
      items,
      total,
      paymentMethod,
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });
    totalAllOrders = totalAllOrders + total;
    const saved = await order.save();
    orderIds.push(saved._id.toString());

  }
  await this.kafka.emit('order.created', {
    userId,
    orderIds,
    paymentMethod,
    products,
    total: totalAllOrders,
  });
  return { success: true, orderIds };
}


  async calculateOrdersTotal(orderIds: string[]) {
    const orders = await this.orderModel.find({
      _id: { $in: orderIds },
    });

    return orders.reduce((sum, o) => sum + o.total, 0);
  }

  async updateOrderStatus_success(dto: {
    orderIds: string[];
    paymentMethod: string;
    total: number;
    paidAmount: number;
  }) {
    const { orderIds, paymentMethod, total, paidAmount } = dto;

    // Xác định status mới
    let newStatus = 'PENDING';

    if (paymentMethod === 'COD') {
      newStatus = 'PENDING_COD';
    } else {
        newStatus = 'PAID';
    }

    // Lưu danh sách order đã update
    const updatedOrders = [];

    // Cập nhật từng order
    for (const orderId of orderIds) {
      const order = await this.orderModel.findById(orderId);
      if (!order) continue;

      order.status = newStatus;
      await order.save();

      updatedOrders.push(order);

      // Emit sự kiện order.status.updated cho từng order
      this.kafka.emit('order.success', {
        order
      });
    }
    console.log('update_status',updatedOrders)
    return {
      success: true,
      status: newStatus,
      updated: updatedOrders.length,
      orders: updatedOrders,
    };
  }


}
