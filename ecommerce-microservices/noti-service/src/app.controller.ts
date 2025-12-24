import { Controller, Logger, Inject } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateNotificationDto,
  FindByUserDto,
  MarkAsReadDto,
} from './dto/notification.dto';
import { NotificationService } from './app.service';
import { ClientKafka } from '@nestjs/microservices';

@Controller()
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(
    private readonly service: NotificationService,
    @Inject('NOTIFICATION_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  /**
   * ===========================================
   *  FIRE & FORGET — RECEIVE EVENT noti.create
   *  (Được emit từ các service khác: order, chat…)
   * ===========================================
   */
  @EventPattern('noti.create')
  async handleCreate(@Payload() payload: CreateNotificationDto) {
    this.logger.log(`📨 Creating notification for user ${payload.userId}`);

    const result = await this.service.create(payload);
    console.log('resultdsd', result.data);
    if (result.success && result.data) {
      const payload = result.data;
      this.logger.log(`✅ Notification saved: ${result.data._id}`);
      console.log('result.data', result.data);
      // 🔥 RẤT QUAN TRỌNG: EMIT "noti.created" ĐỂ GATEWAY PUSH REALTIME
      this.kafkaClient.emit('noti.created', {
        userId: payload.userId,
        title: payload.title,
        content: payload.content,
        type: payload.type,
      });
    } else {
      this.logger.error(`❌ Failed to create notification: ${result.error}`);
    }
  }


  @EventPattern('order.confirmed')
  async handleOrderConfirmed(@Payload() payload: any) {
    this.logger.log(`📨 Creating notification for user ${payload.userId}`);
    const data = {userId: payload.userId, title: 'Đơn hàn đã được xác nhận', content: `Đơn hàng đã được xác nhận và sẽ được giao cho bên vận chuyển`, type: 'ORDER', metadata: {orderId: payload.orderId}};
    const result = await this.service.create(data);

    if (result.success && result.data) {
      this.logger.log(`✅ Notification saved: ${result.data._id}`);

      // 🔥 RẤT QUAN TRỌNG: EMIT "noti.created" ĐỂ GATEWAY PUSH REALTIME
           this.kafkaClient.emit('noti.created', {
        userId: data.userId,
        title: data.title,
        content: data.content,
        type: data.type,
      });
    } else {
      this.logger.error(`❌ Failed to create notification: ${result.error}`);
    }
  }
   
    @EventPattern('review.sellerReplied')
  async handleReviewSellerReplied(@Payload() payload: any) {
    this.logger.log(`📨 Creating notification for user ${payload.userId}`);
    const data = {userId: payload.userId, title: 'Đánh giá đã được trả lời', content: `Người bán đã trả lời đánh giá của bạn`, type: 'REVIEW', metadata: {productId: payload.productId, reviewId: payload.reviewId}};
    const result = await this.service.create(data);

    if (result.success && result.data) {
      this.logger.log(`✅ Notification saved: ${result.data._id}`);

      // 🔥 RẤT QUAN TRỌNG: EMIT "noti.created" ĐỂ GATEWAY PUSH REALTIME
           this.kafkaClient.emit('noti.created', {
        userId: data.userId,
        title: data.title,
        content: data.content,
        type: data.type,
      });
    } else {
      this.logger.error(`❌ Failed to create notification: ${result.error}`);
    }
  }

   @EventPattern('review.created')
  async handleReviewCreated(@Payload() payload: any) {
    this.logger.log(`📨 Creating notification for user ${payload.userId}`);
    const data = {userId: payload.ownerId, title: 'Đơn hàng của bạn có đánh giá mới', content: `Người dùng đã đánh giá sản phẩm của bạn xem ngay!`, type: 'REVIEW', metadata: {productId: payload.productId, reviewId: payload.reviewId}};
    const result = await this.service.create(data);

    if (result.success && result.data) {
      this.logger.log(`✅ Notification saved: ${result.data._id}`);

      // 🔥 RẤT QUAN TRỌNG: EMIT "noti.created" ĐỂ GATEWAY PUSH REALTIME
           this.kafkaClient.emit('noti.created', {
        userId: data.userId,
        title: data.title,
        content: data.content,
        type: data.type,
      });
    } else {
      this.logger.error(`❌ Failed to create notification: ${result.error}`);
    }
  }
  
    @EventPattern('payment.success')
  async handlePaymentSuccess(@Payload() payload: any) {
    this.logger.log(`📨 Creating notification for user ${payload.userId}`);
    const data = {userId: payload.userId, title: 'Đặt hàng thành công!'
      , content: `Đơn hàng đã được chuyển trạng thái đợi người bán xác nhận`, type: 'ORDER', metadata: {orderId: payload.orderIds}};
    const result = await this.service.create(data)
    if (result.success && result.data) {
      this.logger.log(`✅ Notification saved: ${result.data._id}`);

      // 🔥 RẤT QUAN TRỌNG: EMIT "noti.created" ĐỂ GATEWAY PUSH REALTIME
           this.kafkaClient.emit('noti.created', {
        userId: data.userId,
        title: data.title,
        content: data.content,
        type: data.type,
      });
    } else {
      this.logger.error(`❌ Failed to create notification: ${result.error}`);
    }
  }

    @EventPattern('order.rejected')
  async handleOrderRejected(@Payload() payload: any) {
    this.logger.log(`📨 Creating notification for user ${payload.userId}`);
    const data = {userId: payload.userId, title: 'Đơn hàng đã bị từ chối', content: `Đơn hàng đã bị từ chối bởi người bán vui lòng liên hệ để hiểu thêm lí do`, type: 'ORDER', metadata: {orderId: payload.orderId}};
    const result = await this.service.create(data);

    if (result.success && result.data) {
      this.logger.log(`✅ Notification saved: ${result.data._id}`);

      // 🔥 RẤT QUAN TRỌNG: EMIT "noti.created" ĐỂ GATEWAY PUSH REALTIME
           this.kafkaClient.emit('noti.created', {
        userId: data.userId,
        title: data.title,
        content: data.content,
        type: data.type,
      });
    } else {
      this.logger.error(`❌ Failed to create notification: ${result.error}`);
    }
  }

  
    @EventPattern('order.cancel_request.successed')
  async handleOrderCancelled(@Payload() payload: any) {
    this.logger.log(`📨 Creating notification for user ${payload.userId}`);
    const data = {userId: payload.userId, title: 'Đơn hàng đã bị hủy', content: `Yêu cầu hủy đơn hàng đã được người bán duyệt`, type: 'ORDER', metadata: {orderId: payload.orderId}};
    const result = await this.service.create(data);

    if (result.success && result.data) {
      this.logger.log(`✅ Notification saved: ${result.data._id}`);

      // 🔥 RẤT QUAN TRỌNG: EMIT "noti.created" ĐỂ GATEWAY PUSH REALTIME
           this.kafkaClient.emit('noti.created', {
        userId: data.userId,
        title: data.title,
        content: data.content,
        type: data.type,
      });
    } else {
      this.logger.error(`❌ Failed to create notification: ${result.error}`);
    }
  }
  
      @EventPattern('order.cancel_request.failed')
  async handleOrderCancelFailed(@Payload() payload: any) {
    this.logger.log(`📨 Creating notification for user ${payload.userId}`);
    const data = {userId: payload.userId, title: 'Yêu cầu hủy đơn hàng bị từ chối!', content: `Yêu cầu hủy đơn hàng của bạn đã bị người bán từ chối`, type: 'ORDER', metadata: {orderId: payload.orderId}};
    const result = await this.service.create(data);

    if (result.success && result.data) {
      this.logger.log(`✅ Notification saved: ${result.data._id}`);

      // 🔥 RẤT QUAN TRỌNG: EMIT "noti.created" ĐỂ GATEWAY PUSH REALTIME
           this.kafkaClient.emit('noti.created', {
        userId: data.userId,
        title: data.title,
        content: data.content,
        type: data.type,
      });
    } else {
      this.logger.error(`❌ Failed to create notification: ${result.error}`);
    }
  }
    @EventPattern('order.cancel_request.created')
  async handleOrderCancelCreated(@Payload() payload: any) {
    this.logger.log(`📨 Creating notification for user ${payload.sellerId}`);
    const data = {userId: payload.sellerId, title: 'Bạn có yêu cầu hủy đơn hàng cần duyệt!', content: `Người mua đã yêu cầu hủy đơn hàng`, type: 'ORDER', metadata: {orderId: payload.orderId}};
    const result = await this.service.create(data);

    if (result.success && result.data) {
      this.logger.log(`✅ Notification saved: ${result.data._id}`);

      // 🔥 RẤT QUAN TRỌNG: EMIT "noti.created" ĐỂ GATEWAY PUSH REALTIME
           this.kafkaClient.emit('noti.created', {
        userId: data.userId,
        title: data.title,
        content: data.content,
        type: data.type,
      });
    } else {
      this.logger.error(`❌ Failed to create notification: ${result.error}`);
    }
  }

  /**
   * ===========================================
   *   RPC — LẤY DANH SÁCH NOTIFICATION
   * ===========================================
   */
  @MessagePattern('noti.findByUser')
  async handleFindByUser(@Payload() payload: FindByUserDto) {
    this.logger.log(`📋 Fetching notifications for user ${payload.userId}`);
    return await this.service.findByUser(payload);
  }

  /**
   * ===========================================
   *  RPC — ĐÁNH DẤU 1 THÔNG BÁO ĐÃ ĐỌC
   * ===========================================
   */
  @MessagePattern('noti.markAsRead')
  async handleMarkAsRead(@Payload() payload: MarkAsReadDto) {
    this.logger.log(`👁️ Mark notification as read: ${payload.notificationId}`);
    return await this.service.markAsRead(payload);
  }

  /**
   * ===========================================
   *   RPC — LẤY SỐ NOTI CHƯA ĐỌC CỦA USER
   * ===========================================
   */
  @MessagePattern('noti.unreadCount')
  async handleUnreadCount(@Payload() payload: { userId: string }) {
    this.logger.log(`🔢 Get unread notifications count: ${payload.userId}`);
    return await this.service.unreadCount(payload.userId);
  }
}
