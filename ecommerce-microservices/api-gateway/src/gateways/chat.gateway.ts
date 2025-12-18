
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { AiService } from '../modules/ai-guard/ai.service';

interface SendMessagePayload {
  content: string;
  receiverId: string;
  senderId?: string;
  conversationId?: string;
}

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  conversationId?: string;
  timestamp: Date;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  
  // Map để lưu userId -> socketId
  private userSocketMap = new Map<string, string>();

  constructor(
    private readonly aiService: AiService,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  /**
   * Kết nối Kafka client khi module init
   */
  async onModuleInit() {
    // Subscribe các response topics nếu cần request/reply pattern
    this.kafkaClient.subscribeToResponseOf('chat.conversation.findOrCreate');
    this.kafkaClient.subscribeToResponseOf('chat.message.findByConversation');
    this.kafkaClient.subscribeToResponseOf('chat.conversation.findByUser');
    this.kafkaClient.subscribeToResponseOf('chat.message.markAsRead');
    this.kafkaClient.subscribeToResponseOf('chat.message.unreadCount');
    
    await this.kafkaClient.connect();
    this.logger.log('✅ ChatGateway connected to Kafka');
  }

  /**
   * Xử lý khi client kết nối
   */
  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    
    if (userId) {
      this.userSocketMap.set(userId, client.id);
      this.logger.log(`User ${userId} connected with socket ${client.id}`);
    } else {
      this.logger.log(`Anonymous client connected: ${client.id}`);
    }

    // Gửi xác nhận kết nối thành công
    client.emit('connected', {
      message: 'Kết nối thành công',
      socketId: client.id,
      timestamp: new Date(),
    });
  }

  /**
   * Xử lý khi client ngắt kết nối
   */
  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    
    if (userId) {
      this.userSocketMap.delete(userId);
      this.logger.log(`User ${userId} disconnected`);
    } else {
      this.logger.log(`Client disconnected: ${client.id}`);
    }
  }

  /**
   * Xử lý gửi tin nhắn
   */
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessagePayload,
  ) {
    const { content, receiverId, senderId, conversationId } = payload;
    const actualSenderId = senderId || (client.handshake.query.userId as string) || client.id;

    this.logger.debug(`Message from ${actualSenderId} to ${receiverId}: ${content}`);

    // Validate payload
    if (!content || !receiverId) {
      client.emit('error', {
        code: 'INVALID_PAYLOAD',
        message: 'Thiếu nội dung tin nhắn hoặc người nhận',
      });
      return;
    }

    try {
      // Bước 1: AI Check - Kiểm tra nội dung tin nhắn
      const isClean = await this.aiService.validateContent(content, 'CHAT');

      // Bước 2: Decision
      if (!isClean) {
        // Tin nhắn bẩn - Trả về lỗi cho client và KHÔNG xử lý tiếp
        this.logger.warn(`Message blocked from ${actualSenderId}: "${content.substring(0, 50)}..."`);
        
        client.emit('message_blocked', {
          code: 'CONTENT_VIOLATION',
          message: 'Tin nhắn của bạn vi phạm tiêu chuẩn cộng đồng và đã bị chặn.',
          originalContent: content,
          timestamp: new Date(),
        });
        return;
      }

      // Tin nhắn sạch - Tạo message object
      const message: ChatMessage = {
        id: this.generateMessageId(),
        content,
        senderId: actualSenderId,
        receiverId,
        conversationId,
        timestamp: new Date(),
      };

      // 🔥 Emit Kafka event để chat-service lưu vào database
      // Sử dụng emit() cho fire-and-forget pattern (EventPattern)
      this.kafkaClient.emit('chat.message.send', {
        senderId: actualSenderId,
        receiverId,
        content,
        conversationId,
      });
      this.logger.debug(`📤 Emitted chat.message.send to Kafka`);

      // Gửi xác nhận cho người gửi
      client.emit('message_sent', {
        ...message,
        status: 'sent',
      });

      // Gửi tin nhắn cho người nhận (realtime qua WebSocket)
      const receiverSocketId = this.userSocketMap.get(receiverId);
      
      if (receiverSocketId) {
        // Người nhận đang online - gửi trực tiếp
        this.server.to(receiverSocketId).emit('receive_message', message);
        this.logger.debug(`Message delivered to ${receiverId}`);
      } else {
        // Người nhận offline - tin nhắn đã được lưu qua Kafka -> chat-service
        // Khi user online lại, frontend sẽ fetch từ chat-service
        this.logger.debug(`Receiver ${receiverId} is offline. Message saved via Kafka.`);
      }

    } catch (error) {
      this.logger.error(`Error processing message: ${error.message}`);
      
      // Lỗi hệ thống - vẫn cho gửi để không chặn user oan
      client.emit('error', {
        code: 'SYSTEM_ERROR',
        message: 'Có lỗi xảy ra, vui lòng thử lại',
      });
    }
  }

  /**
   * Xử lý typing indicator
   */
  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { receiverId: string; isTyping: boolean },
  ) {
    const senderId = (client.handshake.query.userId as string) || client.id;
    const receiverSocketId = this.userSocketMap.get(payload.receiverId);

    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('user_typing', {
        senderId,
        isTyping: payload.isTyping,
      });
    }
  }

  /**
   * Join vào room conversation
   */
  @SubscribeMessage('join_conversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    client.join(payload.conversationId);
    this.logger.debug(`Client ${client.id} joined conversation ${payload.conversationId}`);
    
    client.emit('joined_conversation', {
      conversationId: payload.conversationId,
      message: 'Đã tham gia cuộc trò chuyện',
    });
  }

  /**
   * Lấy danh sách conversations của user
   * Gọi chat-service qua Kafka
   */
  @SubscribeMessage('get_conversations')
  async handleGetConversations(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId?: string },
  ) {
    const userId = payload?.userId || (client.handshake.query.userId as string);
    
    if (!userId) {
      client.emit('error', { code: 'MISSING_USER_ID', message: 'userId is required' });
      return;
    }

    try {
      const result = await this.kafkaClient
        .send('chat.conversation.findByUser', { userId })
        .toPromise();
      
      client.emit('conversations_list', result);
    } catch (error) {
      this.logger.error(`Error fetching conversations: ${error.message}`);
      client.emit('error', { code: 'FETCH_ERROR', message: 'Không thể tải danh sách hội thoại' });
    }
  }

  /**
   * Lấy lịch sử tin nhắn của conversation
   * Gọi chat-service qua Kafka
   */
  @SubscribeMessage('get_messages')
  async handleGetMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string; limit?: number; skip?: number },
  ) {
    if (!payload?.conversationId) {
      client.emit('error', { code: 'MISSING_CONVERSATION_ID', message: 'conversationId is required' });
      return;
    }

    try {
      const result = await this.kafkaClient
        .send('chat.message.findByConversation', {
          conversationId: payload.conversationId,
          limit: payload.limit || 50,
          skip: payload.skip || 0,
        })
        .toPromise();
      
      client.emit('messages_history', result);
    } catch (error) {
      this.logger.error(`Error fetching messages: ${error.message}`);
      client.emit('error', { code: 'FETCH_ERROR', message: 'Không thể tải lịch sử tin nhắn' });
    }
  }

  /**
   * Tìm hoặc tạo conversation với user khác
   */
  @SubscribeMessage('start_conversation')
  async handleStartConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { targetUserId: string; userId?: string },
  ) {
    const userId = payload?.userId || (client.handshake.query.userId as string);
    
    if (!userId || !payload?.targetUserId) {
      client.emit('error', { code: 'INVALID_PAYLOAD', message: 'userId và targetUserId là bắt buộc' });
      return;
    }

    try {
      const result = await this.kafkaClient
        .send('chat.conversation.findOrCreate', {
          userId1: userId,
          userId2: payload.targetUserId,
        })
        .toPromise();
      
      client.emit('conversation_started', result);
    } catch (error) {
      this.logger.error(`Error starting conversation: ${error.message}`);
      client.emit('error', { code: 'START_ERROR', message: 'Không thể bắt đầu hội thoại' });
    }
  }

  /**
   * Đánh dấu tin nhắn đã đọc
   * TODO: Emit read receipt cho sender
   */
  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string; userId?: string },
  ) {
    const userId = payload?.userId || (client.handshake.query.userId as string);
    
    if (!userId || !payload?.conversationId) {
      client.emit('error', { code: 'INVALID_PAYLOAD', message: 'conversationId là bắt buộc' });
      return;
    }

    try {
      const result = await this.kafkaClient
        .send('chat.message.markAsRead', {
          conversationId: payload.conversationId,
          userId,
        })
        .toPromise();
      
      client.emit('messages_marked_read', result);

      // TODO: Notify sender về read receipt
      // const senderSocketId = this.userSocketMap.get(senderId);
      // if (senderSocketId) {
      //   this.server.to(senderSocketId).emit('message_read', { conversationId, readBy: userId });
      // }
    } catch (error) {
      this.logger.error(`Error marking as read: ${error.message}`);
      client.emit('error', { code: 'MARK_READ_ERROR', message: 'Không thể đánh dấu đã đọc' });
    }
  }

  /**
   * Lấy số tin nhắn chưa đọc
   */
  @SubscribeMessage('get_unread_count')
  async handleGetUnreadCount(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId?: string },
  ) {
    const userId = payload?.userId || (client.handshake.query.userId as string);
    
    if (!userId) {
      client.emit('error', { code: 'MISSING_USER_ID', message: 'userId is required' });
      return;
    }

    try {
      const result = await this.kafkaClient
        .send('chat.message.unreadCount', { userId })
        .toPromise();
      
      client.emit('unread_count', result);
    } catch (error) {
      this.logger.error(`Error getting unread count: ${error.message}`);
      client.emit('error', { code: 'FETCH_ERROR', message: 'Không thể lấy số tin nhắn chưa đọc' });
    }
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
