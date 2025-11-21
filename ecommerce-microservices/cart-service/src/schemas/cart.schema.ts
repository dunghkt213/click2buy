import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Cart Item sub-document
 */
@Schema({ _id: false })
export class CartItem {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true, min: 1 })
  quantity: number;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

/**
 * Cart Document
 * Stores user's shopping cart data in MongoDB
 */
@Schema({ timestamps: true })
export class Cart extends Document {
  @Prop({ required: true, unique: true, index: true })
  userId: string;

  @Prop({ type: [CartItemSchema], default: [] })
  items: CartItem[];

  @Prop({ default: 0 })
  discount: number;

  @Prop({ default: false })
  freeShipping: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

// Create index on userId for faster lookups
CartSchema.index({ userId: 1 });
