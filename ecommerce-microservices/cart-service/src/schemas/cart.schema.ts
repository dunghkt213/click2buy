import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CartDocument = Cart & Document;

@Schema({ _id: false})
export class CartItem {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number;
}


@Schema({ timestamps: true })
export class Cart extends Document {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true })
  sellerId: string;   // SHOP !!!

  @Prop({ type: [CartItem], default: [] })
  items: CartItem[];
}


export const CartSchema = SchemaFactory.createForClass(Cart);
