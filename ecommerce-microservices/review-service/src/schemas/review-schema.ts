import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { createMongoSchema } from './mongo-schema.util';

/**
 * Kiểu Mongoose document
 */
export type ReviewDocument = Review & Document;

/**
 * Schema chính cho collection "reviews"
 */
@Schema({ timestamps: true, collection: 'reviews' })
export class Review {
  // 🔹 ID sản phẩm (chỉ lưu ID, không ref vì là microservice)
  @Prop({ required: true, trim: true, index: true })
  productId: string;

  // 🔹 ID người dùng (chỉ lưu ID)
  @Prop({ required: true, trim: true, index: true })
  userId: string;

  // 🔹 Số sao (1–5)
  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  // 🔹 Nội dung nhận xét
  @Prop({ required: false, trim: true })
  comment?: string;

  // 🔹 Ảnh kèm theo (nếu có)
  @Prop({ type: [String], default: [] })
  images: string[];

  // 🔹 Trạng thái duyệt (admin moderation)
  @Prop({ default: false })
  isApproved: boolean;
}

/**
 * Xuất schema chuẩn hóa
 */
export const ReviewSchema = createMongoSchema(Review);

/**
 * Index hỗ trợ truy vấn nhanh
 */
ReviewSchema.index({ productId: 1 });
ReviewSchema.index({ userId: 1 });
ReviewSchema.index({ rating: -1 });
ReviewSchema.index({ isApproved: 1 });
ReviewSchema.index({ createdAt: -1 });
