import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CartDocument = Cart & Document;

@Schema({ timestamps: true })
export class CartItem {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number;
}

@Schema({ timestamps: true })
export class Cart {
  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ type: [CartItem], default: [] })
  items: CartItem[];

  @Prop({ default: 5 })
  discount: number;

  @Prop({ default: true })
  freeShipping: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
