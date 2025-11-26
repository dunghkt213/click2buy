// src/schemas/payment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true, enum: ['COD', 'BANKING'] })
  paymentMethod: string;

  @Prop({ required: true })
  total: number;

  @Prop({ required: true })
  paidAmount: number;

  @Prop({ default: 'PENDING' })
  status: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
