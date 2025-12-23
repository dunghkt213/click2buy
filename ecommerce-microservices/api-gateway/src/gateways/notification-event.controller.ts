import { Controller, Inject, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationGateway } from './notification.gateway';

/**
 * Controller riêng để lắng nghe Kafka events
 * WebSocketGateway không thể dùng @EventPattern trực tiếp
 */
@Controller()
export class NotificationEventController {
  private readonly logger = new Logger(NotificationEventController.name);

  constructor(
    private readonly notificationGateway: NotificationGateway,
  ) {}

  /**
   * Lắng nghe Kafka event 'noti.created' từ noti-service
   * Sau đó push qua WebSocket đến user tương ứng
   */
  @EventPattern('noti.created')
  handleNotificationCreated(@Payload() payload: any) {
    this.logger.log(`📨 Received noti.created event for user ${payload.userId}`);
    
    // Delegate đến NotificationGateway để push qua WebSocket
    this.notificationGateway.handleNotificationCreated(payload);
  }
}

