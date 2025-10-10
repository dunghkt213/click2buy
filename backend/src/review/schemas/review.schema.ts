import { Prop, Schema } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { createMongoSchema } from 'src/common/utils/mongo-schema.util';
import { User } from 'src/user/schemas/user.schema';

/**
 * Kiểu document cho Review
 */
export type ReviewDocument = Review & Document;

/**
 * Schema chính cho collection "reviews"
 */
@Schema({ timestamps: true, collection: 'reviews' })
export class Review {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  productId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ trim: true })
  comment?: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: false })
  isApproved: boolean;
}

export const ReviewSchema = createMongoSchema(Review);

