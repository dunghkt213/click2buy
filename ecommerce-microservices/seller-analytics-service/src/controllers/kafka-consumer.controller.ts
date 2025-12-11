import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AnalyticsService } from '../analytics.service';

@Controller()
export class KafkaConsumerController {
  private readonly logger = new Logger(KafkaConsumerController.name);

  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Lắng nghe khi Seller duyệt đơn - CHỈ đếm số đơn, KHÔNG cộng doanh thu
   */
  @EventPattern('order.confirmed')
  async handleOrderConfirmed(@Payload() data: any) {
    this.logger.log(`📥 Received order.confirmed event: ${JSON.stringify(data)}`);
    try {
      await this.analyticsService.handleOrderConfirmed(data);
    } catch (error) {
      this.logger.error(`❌ Error processing order.confirmed: ${error.message}`, error.stack);
    }
  }

  /**
   * Lắng nghe khi đơn hàng giao thành công - CỘNG DOANH THU TẠI ĐÂY
   */
  @EventPattern('order.completed')
  async handleOrderCompleted(@Payload() data: any) {
    this.logger.log(`📥 Received order.completed event: ${JSON.stringify(data)}`);
    try {
      await this.analyticsService.handleOrderCompleted(data);
    } catch (error) {
      this.logger.error(`❌ Error processing order.completed: ${error.message}`, error.stack);
    }
  }
}