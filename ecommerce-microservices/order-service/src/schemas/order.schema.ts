import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  orderCode: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ type: Array, required: true })
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];

  @Prop({ required: true })
  total: number;

 @Prop({ required: true })
  ownerId: string;

  @Prop({ default: 'PENDING' })
  status: string;

 @Prop({ required: true })
  paymentMethod: string;

  @Prop()
  expiresAt: Date;

  @Prop()
  createAt: Date;

}

export const OrderSchema = SchemaFactory.createForClass(Order);
