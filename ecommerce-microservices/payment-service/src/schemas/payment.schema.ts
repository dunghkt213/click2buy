// src/schemas/payment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentDocument = Payment & Document;

export class PaymentItem {
  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  total: number;
}

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  ownerId: string;

  @Prop({ type: [PaymentItem], required: true })
  items: PaymentItem[];

  @Prop({ required: true })
  total: number;

  @Prop({ default: 0 })
  paidAmount: number;

  @Prop({ required: true, enum: ['COD', 'BANKING'] })
  paymentMethod: string;

  @Prop({ default: 'PENDING' })
  status: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
