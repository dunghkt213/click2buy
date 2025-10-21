import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop([
    {
      _id: false,
      productId: { type: Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 },
    },
  ])
  items: {
    productId: Types.ObjectId;
    quantity: number;
    price: number;
  }[];

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ default: 'pending', enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] })
  status: string;

  @Prop({ default: 'unpaid', enum: ['unpaid', 'paid', 'refunded'] })
  paymentStatus: string;

  @Prop({ required: false })
  trackingNumber?: string;

  @Prop({ required: false })
  expectedDeliveryDate?: Date;

  @Prop({
    _id: false,
    type: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
      zip: { type: String, required: false },
    },
  })
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    country: string;
    zip?: string;
  };

  @Prop({ required: true, enum: ['GHN', 'GHTK', 'VNPost', 'Other'], default: 'GHN' })
  shippingMethod: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
