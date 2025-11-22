import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClientKafka } from '@nestjs/microservices';

import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-status.dto';
import Redis from 'ioredis/built/Redis';

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

  async createOrder(dto: CreateOrderDto) {
    console.log('Creating order with data:', dto);
    const order = new this.orderModel(dto);
    await order.save();
    const order_Id = order._id.toString();
    this.kafka.emit('order.created', {
      ...dto,
      orderId: order_Id,
    });

    this.logger.log(`📦 Order created: ${order._id}`);
    const key = `order:${order_Id}:paymentPending`;
    const ttl = 60; // 60 giây

    await this.redis.set(key, 1, 'EX', ttl);
    this.logger.log(`⏳ Redis TTL set: key=${key}, expiresIn=60s`);
    return order;
  }

  async updateOrderStatus(dto: UpdateOrderStatusDto) {
    const order = await this.orderModel.findById(dto.orderId);
    if (!order) return null;

    order.status = dto.status;
    await order.save();

    this.kafka.emit('order.status.updated', {
      orderId: dto.orderId,
      status: dto.status,
    });

    return order;
  }
}
