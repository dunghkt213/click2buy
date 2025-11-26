import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderSnapshotDocument = OrderSnapshot & Document;

/**
 * Schema lưu snapshot đơn hàng để phục vụ API /seller/orders
 * Được sync từ order-service qua Kafka event order.created
 */
@Schema({ timestamps: true })
export class OrderSnapshot {
  @Prop({ required: true, unique: true, index: true })
  orderId: string; // ID từ order-service

  @Prop({
    type: [
      {
        productId: String,
        quantity: Number,
        price: Number,
      },
    ],
    required: true,
  })
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];

  @Prop({ required: true })
  totalAmount: number; // Tổng tiền đơn hàng

  @Prop({ default: 'PENDING', index: true })
  status: string; // PENDING, CONFIRMED, CANCELLED

  @Prop({ required: true })
  createdAt: Date;
}

export const OrderSnapshotSchema =
  SchemaFactory.createForClass(OrderSnapshot);

