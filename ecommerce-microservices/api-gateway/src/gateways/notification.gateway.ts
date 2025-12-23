import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  SubscribeMessage,
  MessageBody
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import { ClientKafka, EventPattern, Payload } from '@nestjs/microservices';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/notification',
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {

  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  private userSocketMap = new Map<string, string>();

  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    // Các RPC từ noti-service
    this.kafkaClient.subscribeToResponseOf('noti.findByUser');
    this.kafkaClient.subscribeToResponseOf('noti.unreadCount');
    this.kafkaClient.subscribeToResponseOf('noti.markAsRead');

    // Lắng nghe Kafka event realtime
    // => Đây là event PATTERN, cần EventPattern(), không phải SubscribeMessage
    this.kafkaClient.subscribeToResponseOf('noti.created');

    await this.kafkaClient.connect();
    this.logger.log('✅ NotificationGateway connected to Kafka');
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (userId) {
      this.userSocketMap.set(userId, client.id);
      this.logger.log(`🔌 User ${userId} connected`);
    }

    client.emit('connected', {
      socketId: client.id,
      message: 'Notification socket connected'
    });
  }

  handleDisconnect(client: Socket) {
    const userId = [...this.userSocketMap.entries()]
      .find(([_, sid]) => sid === client.id)?.[0];

    if (userId) {
      this.userSocketMap.delete(userId);
      this.logger.log(`❌ User ${userId} disconnected`);
    }
  }

  /**
   * REALTIME NOTIFICATION (Kafka → Gateway → User)
   * Đây là event Kafka, nên phải dùng EventPattern
   */
  @EventPattern('noti.created')
  handleNotificationCreated(@Payload() payload: any) {
    const socketId = this.userSocketMap.get(payload.userId);

    if (socketId) {
      this.server.to(socketId).emit('notification', payload);
      this.logger.log(`📨 Pushed notification to user ${payload.userId}`);
    }
  }

  /**
   * FE yêu cầu: Lấy danh sách thông báo
   */
  @SubscribeMessage('get_notifications')
  async handleGetNotifications(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId?: string }
  ) {
    const userId = payload?.userId || client.handshake.query.userId;
    if (!userId) return;

    const result = await this.kafkaClient
      .send('noti.findByUser', { userId })
      .toPromise();

    client.emit('notifications_list', result);
  }

  /**
   * FE yêu cầu: Lấy số chưa đọc
   */
  @SubscribeMessage('get_unread')
  async handleUnread(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId?: string }
  ) {
    const userId = payload?.userId || client.handshake.query.userId;

    const result = await this.kafkaClient
      .send('noti.unreadCount', { userId })
      .toPromise();

    client.emit('unread_count', result);
  }

  /**
   * FE yêu cầu: Đánh dấu đã đọc
   */
  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId?: string; notificationId: string }
  ) {
    const userId = payload?.userId || client.handshake.query.userId;

    const result = await this.kafkaClient
      .send('noti.markAsRead', {
        userId,
        notificationId: payload.notificationId,
      })
      .toPromise();

    client.emit('marked_read', result);
  }
}
