import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClientKafka } from '@nestjs/microservices';
import {
  OrderSnapshot,
  OrderSnapshotDocument,
} from '../schemas/order-snapshot.schema';

/**
 * Service xử lý logic đơn hàng cho Seller
 */
@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectModel(OrderSnapshot.name)
    private readonly orderSnapshotModel: Model<OrderSnapshotDocument>,
    @Inject('KAFKA_PRODUCER')
    private readonly kafka: ClientKafka,
  ) {}

  /**
   * Lấy danh sách đơn hàng với phân trang và lọc theo status
   */
  async findAll(page: number = 0, size: number = 10, status?: string) {
    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    const items = await this.orderSnapshotModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(page * size)
      .limit(size)
      .exec();

    const total = await this.orderSnapshotModel.countDocuments(filter);

    return {
      items,
      total,
      page,
      size,
    };
  }

  /**
   * Lấy chi tiết đơn hàng
   */
  async findOne(orderId: string) {
    const order = await this.orderSnapshotModel.findOne({ orderId });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    return order;
  }

  /**
   * Duyệt đơn hàng
   * - Update status = CONFIRMED trong DB
   * - Emit event order.confirmed với payload { orderId, items: [...] }
   */
  async confirmOrder(orderId: string) {
    const order = await this.findOne(orderId);

    if (order.status !== 'PENDING') {
      throw new Error(`Order ${orderId} is not in PENDING status`);
    }

    order.status = 'CONFIRMED';
    await order.save();

    // Emit event order.confirmed để Inventory service trừ kho
    this.kafka.emit('order.confirmed', {
      orderId: order.orderId,
      items: order.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    });

    this.logger.log(`✅ Order confirmed: ${orderId}`);

    return order;
  }

  /**
   * Từ chối đơn hàng

  * - Update status = CANCELLED trong DB
   * - Emit event order.cancelled
   */
  async rejectOrder(orderId: string) {
    const order = await this.findOne(orderId);

    order.status = 'CANCELLED';
    await order.save();

    // Emit event order.cancelled
    this.kafka.emit('order.cancelled', {
      orderId: order.orderId,
      totalAmount: order.totalAmount,
    });

    this.logger.log(`❌ Order rejected: ${orderId}`);

    return order;
  }

  /**
   * Sync đơn hàng từ Kafka event order.created
   * Lưu snapshot với status = PENDING
   */
  async syncOrderFromEvent(data: {
    orderId: string;
    items: { productId: string; quantity: number; price: number }[];
    totalAmount: number;
    createdAt?: Date;
  }) {
    try {
      await this.orderSnapshotModel.findOneAndUpdate(
        { orderId: data.orderId },
        {
          orderId: data.orderId,
          items: data.items,
          totalAmount: data.totalAmount,
          status: 'PENDING',
          createdAt: data.createdAt || new Date(),
        },
        { upsert: true, new: true },
      );

      this.logger.log(`🔄 Synced order snapshot: ${data.orderId}`);
    } catch (error) {
      this.logger.error(
        `❌ Error syncing order: ${error.message}`,
        error.stack,
      );
    }
  }
}

