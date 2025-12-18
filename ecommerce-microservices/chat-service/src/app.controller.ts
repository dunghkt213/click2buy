import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, KafkaContext, EventPattern } from '@nestjs/microservices';
import { AppService } from './app.service.js';
import {
  CreateMessageDto,
  FindOrCreateConversationDto,
  FindMessagesByConversationDto,
  MarkAsReadDto,
} from './dto/create-message.dto.js';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  /**
   * ====================================
   * KAFKA EVENT PATTERN (Fire & Forget)
   * ====================================
   */

  /**
   * Consume event từ ChatGateway khi tin nhắn đã pass AI moderation
   * Event: chat.message.send
   */
  @EventPattern('chat.message.send')
  async handleMessageSend(@Payload() payload: CreateMessageDto, @Ctx() context: KafkaContext) {
    const topic = context.getTopic();
    const partition = context.getPartition();
    const offset = context.getMessage().offset;

    this.logger.log(`📩 Received message event [${topic}] partition=${partition} offset=${offset}`);
    this.logger.debug(`Payload: ${JSON.stringify(payload)}`);

    try {
      const result = await this.appService.saveMessage(payload);
      
      if (result.success) {
        this.logger.log(`✅ Message saved successfully: ${result.data?.message?._id}`);
        
        // TODO: Emit event chat.message.saved để notify các service khác (nếu cần)
        // Ví dụ: notification-service có thể listen để push notification
      } else {
        this.logger.error(`❌ Failed to save message: ${result.error}`);
      }
    } catch (error) {
      // Fail-safe: Log error nhưng không crash service
      this.logger.error(`❌ Error processing message event: ${error.message}`, error.stack);
    }
  }

  /**
   * ====================================
   * KAFKA MESSAGE PATTERN (Request/Reply)
   * ====================================
   */

  /**
   * Tìm hoặc tạo conversation giữa 2 users
   * Pattern: chat.conversation.findOrCreate
   */
  @MessagePattern('chat.conversation.findOrCreate')
  async findOrCreateConversation(@Payload() payload: FindOrCreateConversationDto) {
    this.logger.log(`🔍 Finding/creating conversation: ${payload.userId1} <-> ${payload.userId2}`);
    
    try {
      return await this.appService.findOrCreateConversation(payload);
    } catch (error) {
      this.logger.error(`Error in findOrCreateConversation: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Lấy messages theo conversation
   * Pattern: chat.message.findByConversation
   */
  @MessagePattern('chat.message.findByConversation')
  async findMessagesByConversation(@Payload() payload: FindMessagesByConversationDto) {
    this.logger.log(`📜 Fetching messages for conversation: ${payload.conversationId}`);
    
    try {
      return await this.appService.findMessagesByConversation(payload);
    } catch (error) {
      this.logger.error(`Error in findMessagesByConversation: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Lấy danh sách conversations của user
   * Pattern: chat.conversation.findByUser
   */
  @MessagePattern('chat.conversation.findByUser')
  async findConversationsByUser(@Payload() payload: { userId: string }) {
    this.logger.log(`📋 Fetching conversations for user: ${payload.userId}`);
    
    try {
      return await this.appService.findConversationsByUser(payload.userId);
    } catch (error) {
      this.logger.error(`Error in findConversationsByUser: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Đánh dấu tin nhắn đã đọc
   * Pattern: chat.message.markAsRead
   * TODO: Implement read receipt notification
   */
  @MessagePattern('chat.message.markAsRead')
  async markAsRead(@Payload() payload: MarkAsReadDto) {
    this.logger.log(`👁️ Marking messages as read: conversation=${payload.conversationId}, user=${payload.userId}`);
    
    try {
      return await this.appService.markAsRead(payload);
    } catch (error) {
      this.logger.error(`Error in markAsRead: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Lấy số tin nhắn chưa đọc của user
   * Pattern: chat.message.unreadCount
   */
  @MessagePattern('chat.message.unreadCount')
  async getUnreadCount(@Payload() payload: { userId: string }) {
    this.logger.log(`🔢 Getting unread count for user: ${payload.userId}`);
    
    try {
      return await this.appService.getUnreadCount(payload.userId);
    } catch (error) {
      this.logger.error(`Error in getUnreadCount: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}
