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
import { Logger } from '@nestjs/common';
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
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  
  // Map để lưu userId -> socketId
  private userSocketMap = new Map<string, string>();

  constructor(private readonly aiService: AiService) {}

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

      // Gửi xác nhận cho người gửi
      client.emit('message_sent', {
        ...message,
        status: 'sent',
      });

      // Gửi tin nhắn cho người nhận
      const receiverSocketId = this.userSocketMap.get(receiverId);
      
      if (receiverSocketId) {
        // Người nhận đang online - gửi trực tiếp
        this.server.to(receiverSocketId).emit('receive_message', message);
        this.logger.debug(`Message delivered to ${receiverId}`);
      } else {
        // Người nhận offline - log và có thể lưu vào queue/database
        this.logger.debug(`Receiver ${receiverId} is offline. Message queued.`);
        
        // TODO: Tích hợp với Message Service để lưu tin nhắn offline
        // await this.messageService.saveOfflineMessage(message);
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
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
