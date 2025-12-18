// src/schemas/payment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentDocument = Payment & Document;

export enum PaymentStatus {
  PENDING = 'PENDING',   // Đã tạo QR, chờ thanh toán
  PAID = 'PAID',         // Thanh toán thành công
  FAILED = 'FAILED',     // Thanh toán lỗi / bị huỷ
}

@Schema({ timestamps: true })
export class Payment {

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  orderIds: string[];

  @Prop({ required: true, index: true })
  orderCode: string;

  @Prop({ required: true, enum: ['COD', 'BANKING'] })
  paymentMethod: string;

  @Prop({ required: true })
  total: number;

  @Prop({ required: true })
  paidAmount: number;

  @Prop({
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Prop()
  checkoutUrl: string;   // 👈 BẮT BUỘC THÊM

  @Prop()
  qrCode: string;        // 👈 BẮT BUỘC THÊM

  @Prop({ type: Date })
  expireAt: Date;     // optional
  
  @Prop()
  paymentLinkId: string; // optional

}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
