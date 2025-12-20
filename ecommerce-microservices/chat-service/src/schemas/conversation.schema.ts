import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { createMongoSchema } from './mongo-schema.util.js';

/**
 * Kiểu Mongoose document
 */
export type ConversationDocument = Conversation & Document;

/**
 * Schema cho collection "conversations"
 * Quản lý cuộc hội thoại giữa 2 users
 */
@Schema({ timestamps: true, collection: 'conversations' })
export class Conversation {
  // 🔹 Danh sách participants (2 userId)
  @Prop({ type: [String], required: true, index: true })
  participants: string[];

  // 🔹 Nội dung tin nhắn cuối cùng (preview)
  @Prop({ type: String, default: '' })
  lastMessage: string;

  // 🔹 Thời gian tin nhắn cuối
  @Prop({ type: Date, default: null })
  lastMessageAt: Date;

  // 🔹 Số tin nhắn chưa đọc theo từng user
  // Format: { "userId1": 0, "userId2": 2 }
  @Prop({ type: Object, default: {} })
  unreadCount: Record<string, number>;
}

/**
 * Xuất schema chuẩn hóa
 */
export const ConversationSchema = createMongoSchema(Conversation);

/**
 * Index hỗ trợ truy vấn nhanh
 */
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1 });
ConversationSchema.index({ createdAt: -1 });
