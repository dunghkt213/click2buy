import { Prop, Schema } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { createMongoSchema } from '../../common/utils/mongo-schema.util';

@Schema({ timestamps: true, collection: 'carts' })
export class Cart extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop([
      {
        _id: false,
      productId: { type: Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true, min: 1 },
    },
  ])
  items: {
    productId: Types.ObjectId;
    quantity: number;
  }[];
}

export const CartSchema = createMongoSchema(Cart);
