import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AnalyticsService } from '../analytics.service';

@Controller()
export class KafkaConsumerController {
  private readonly logger = new Logger(KafkaConsumerController.name);

  constructor(private readonly analyticsService: AnalyticsService) {}

  @EventPattern('order.confirmed')
  async handleOrderConfirmed(@Payload() data: any) {
    this.logger.log(`📥 Received order.confirmed event: ${JSON.stringify(data)}`);
    try {
      await this.analyticsService.handleOrderConfirmed(data);
    } catch (error) { 
      this.logger.error(`❌ Error processing order.confirmed: ${error.message}`, error.stack);
    }
  }
}