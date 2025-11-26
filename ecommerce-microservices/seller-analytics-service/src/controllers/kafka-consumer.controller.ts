import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrderService } from '../services/order.service';
import { AnalyticsService } from '../services/analytics.service';

/**
 * Controller lắng nghe các sự kiện Kafka
 * - order.created: Lưu snapshot đơn hàng (Status: PENDING)
 * - order.delivery.success: Cộng dồn doanh thu theo ngày
 */
@Controller()
export class KafkaConsumerController {
  private readonly logger = new Logger(KafkaConsumerController.name);

  constructor(
    private readonly orderService: OrderService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  /**
   * Lắng nghe sự kiện order.created từ Kafka
   * Lưu snapshot đơn hàng với status = PENDING
   */
  @MessagePattern('order.created')
  async handleOrderCreated(@Payload() data: any) {
    this.logger.log(
      `📥 Received order.created event: ${JSON.stringify(data)}`,
    );

    try {
      await this.orderService.syncOrderFromEvent({
        orderId: data.orderId || data._id?.toString(),
        items: data.items || [],
        totalAmount: data.totalAmount || data.total || 0,
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      });

      this.logger.log(
        `✅ Order snapshot synced: ${data.orderId || data._id?.toString()}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Error processing order.created: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Lắng nghe sự kiện order.delivery.success từ Kafka
   * Cộng dồn doanh thu và số lượng đơn hàng theo ngày
   */
  @MessagePattern('order.delivery.success')
  async handleDeliverySuccess(@Payload() data: any) {
    this.logger.log(
      `📥 Received order.delivery.success event: ${JSON.stringify(data)}`,
    );

    try {
      await this.analyticsService.handleDeliverySuccess({
        orderId: data.orderId || data._id?.toString(),
        totalAmount: data.totalAmount || data.total || 0,
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      });
    } catch (error) {
      this.logger.error(
        `❌ Error processing order.delivery.success: ${error.message}`,
        error.stack,
      );
    }
  }
}

