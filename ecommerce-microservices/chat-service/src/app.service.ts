import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation, ConversationDocument } from './schemas/conversation.schema.js';
import { Message, MessageDocument, MessageStatus } from './schemas/message.schema.js';
import {
  CreateMessageDto,
  FindOrCreateConversationDto,
  FindMessagesByConversationDto,
  MarkAsReadDto,
} from './dto/create-message.dto.js';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectModel(Conversation.name) private readonly conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>,
  ) {}

  /**
   * Tìm hoặc tạo conversation giữa 2 users
   */
  async findOrCreateConversation(dto: FindOrCreateConversationDto) {
    const { userId1, userId2 } = dto;
    
    // Sort participants để đảm bảo tìm kiếm nhất quán
    const participants = [userId1, userId2].sort();

    try {
      // Tìm conversation đã tồn tại
      let conversation = await this.conversationModel.findOne({
        participants: { $all: participants, $size: 2 },
      });

      // Nếu chưa có, tạo mới
      if (!conversation) {
        conversation = await this.conversationModel.create({
          participants,
          lastMessage: '',
          lastMessageAt: null,
          unreadCount: { [userId1]: 0, [userId2]: 0 },
        });
        this.logger.log(`Created new conversation: ${conversation._id}`);
      }

      return {
        success: true,
        data: conversation,
      };
    } catch (error) {
      this.logger.error(`Error finding/creating conversation: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Lưu tin nhắn mới vào database
   * Được gọi từ Kafka consumer khi nhận event chat.message.send
   */
  async saveMessage(dto: CreateMessageDto) {
    const { senderId, receiverId, content, conversationId } = dto;

    try {
      // Bước 1: Tìm hoặc tạo conversation
      let convId: Types.ObjectId;
      
      if (conversationId && Types.ObjectId.isValid(conversationId)) {
        convId = new Types.ObjectId(conversationId);
      } else {
        const convResult = await this.findOrCreateConversation({
          userId1: senderId,
          userId2: receiverId,
        });
        
        if (!convResult.success || !convResult.data) {
          throw new Error('Failed to find/create conversation');
        }
        convId = convResult.data._id as Types.ObjectId;
      }

      // Bước 2: Tạo message mới
      const message = await this.messageModel.create({
        conversationId: convId,
        senderId,
        receiverId,
        content,
        isRead: false,
        status: MessageStatus.SENT,
      });

      // Bước 3: Cập nhật conversation
      await this.conversationModel.findByIdAndUpdate(convId, {
        lastMessage: content.substring(0, 100), // Truncate for preview
        lastMessageAt: new Date(),
        $inc: { [`unreadCount.${receiverId}`]: 1 },
      });

      this.logger.log(`Message saved: ${message._id} in conversation ${convId}`);

      return {
        success: true,
        data: {
          message,
          conversationId: convId.toHexString(),
        },
      };
    } catch (error) {
      this.logger.error(`Error saving message: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Lấy danh sách messages theo conversation
   */
  async findMessagesByConversation(dto: FindMessagesByConversationDto) {
    const { conversationId, limit = 50, skip = 0 } = dto;

    try {
      if (!Types.ObjectId.isValid(conversationId)) {
        return { success: false, error: 'Invalid conversationId' };
      }

      const messages = await this.messageModel
        .find({ conversationId: new Types.ObjectId(conversationId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await this.messageModel.countDocuments({
        conversationId: new Types.ObjectId(conversationId),
      });

      return {
        success: true,
        data: messages.reverse(), // Trả về theo thứ tự cũ -> mới
        pagination: {
          total,
          limit,
          skip,
          hasMore: skip + messages.length < total,
        },
      };
    } catch (error) {
      this.logger.error(`Error fetching messages: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Lấy danh sách conversations của user
   */
  async findConversationsByUser(userId: string) {
    try {
      const conversations = await this.conversationModel
        .find({ participants: userId })
        .sort({ lastMessageAt: -1 })
        .lean();

      return {
        success: true,
        data: conversations,
      };
    } catch (error) {
      this.logger.error(`Error fetching conversations: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Đánh dấu tin nhắn đã đọc
   * TODO: Implement read receipt với Kafka event
   */
  async markAsRead(dto: MarkAsReadDto) {
    const { conversationId, userId } = dto;

    try {
      if (!Types.ObjectId.isValid(conversationId)) {
        return { success: false, error: 'Invalid conversationId' };
      }

      const convId = new Types.ObjectId(conversationId);

      // Cập nhật tất cả messages chưa đọc trong conversation
      const result = await this.messageModel.updateMany(
        {
          conversationId: convId,
          receiverId: userId,
          isRead: false,
        },
        {
          isRead: true,
          readAt: new Date(),
          status: MessageStatus.READ,
        },
      );

      // Reset unread count cho user
      await this.conversationModel.findByIdAndUpdate(convId, {
        [`unreadCount.${userId}`]: 0,
      });

      this.logger.log(`Marked ${result.modifiedCount} messages as read for user ${userId}`);

      // TODO: Emit Kafka event chat.message.read để notify sender
      // await this.kafkaClient.emit('chat.message.read', { conversationId, userId });

      return {
        success: true,
        data: {
          modifiedCount: result.modifiedCount,
        },
      };
    } catch (error) {
      this.logger.error(`Error marking messages as read: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Lấy số tin nhắn chưa đọc của user
   */
  async getUnreadCount(userId: string) {
    try {
      const count = await this.messageModel.countDocuments({
        receiverId: userId,
        isRead: false,
      });

      return {
        success: true,
        data: { unreadCount: count },
      };
    } catch (error) {
      this.logger.error(`Error getting unread count: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
