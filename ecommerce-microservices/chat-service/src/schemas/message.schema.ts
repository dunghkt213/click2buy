import { Prop, Schema } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { createMongoSchema } from './mongo-schema.util.js';

/**
 * Kiểu Mongoose document
 */
export type MessageDocument = Message & Document;

/**
 * Enum trạng thái tin nhắn
 */
export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

/**
 * Schema cho collection "messages"
 * Lưu trữ từng tin nhắn trong conversation
 */
@Schema({ timestamps: true, collection: 'messages' })
export class Message {
  // 🔹 ID cuộc hội thoại
  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true, index: true })
  conversationId: Types.ObjectId;

  // 🔹 ID người gửi
  @Prop({ required: true, trim: true, index: true })
  senderId: string;

  // 🔹 ID người nhận
  @Prop({ required: true, trim: true, index: true })
  receiverId: string;

  // 🔹 Nội dung tin nhắn
  @Prop({ required: true, trim: true })
  content: string;

  // 🔹 Trạng thái đã đọc
  @Prop({ default: false })
  isRead: boolean;

  // 🔹 Thời gian đọc
  @Prop({ type: Date, default: null })
  readAt: Date;

  // TODO: Message status (sent/delivered/read) cho read receipt
  @Prop({ type: String, enum: MessageStatus, default: MessageStatus.SENT })
  status: MessageStatus;

  // TODO: Hỗ trợ attachments (images, files)
  // @Prop({ type: [String], default: [] })
  // attachments: string[];
}

/**
 * Xuất schema chuẩn hóa
 */
export const MessageSchema = createMongoSchema(Message);

/**
 * Index hỗ trợ truy vấn nhanh
 */
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1 });
MessageSchema.index({ receiverId: 1 });
MessageSchema.index({ isRead: 1 });
MessageSchema.index({ createdAt: -1 });
