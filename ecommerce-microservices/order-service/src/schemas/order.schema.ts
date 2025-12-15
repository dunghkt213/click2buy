import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  orderCode: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  ownerId: string;

  @Prop({
    type: [
      {
        productId: String,
        quantity: Number,
        price: Number, // giá sau discount của product
      },
    ],
    required: true,
  })
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];

  // ===== TIỀN =====

  /** Tổng tiền sản phẩm (sum items) */
  @Prop({ required: true })
  subtotal: number;

  /** Phí vận chuyển */
  @Prop({ default: 0 })
  shippingFee: number;

  /** Mã voucher */
  @Prop()
  voucherCode?: string;

  /** Số tiền giảm từ voucher */
  @Prop({ default: 0 })
  voucherDiscount: number;

  /** Giảm giá theo phương thức thanh toán */
  @Prop({ default: 0 })
  paymentDiscount: number;

  /** Tổng tiền cuối cùng – DÙNG ĐỂ TẠO QR */
  @Prop({ required: true })
  finalTotal: number;

  // ===== KHÁC =====

  @Prop({ required: true })
  paymentMethod: string;

  @Prop({ default: 'PENDING_PAYMENT' })
  status: string;

  @Prop()
  expiresAt: Date;
}


export const OrderSchema = SchemaFactory.createForClass(Order);
