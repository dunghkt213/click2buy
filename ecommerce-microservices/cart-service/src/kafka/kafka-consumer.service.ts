import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer, logLevel } from 'kafkajs';
import { InventoryStockUpdatedEvent } from './kafka.interfaces';

/**
 * Kafka Consumer Service
 * Consumes inventory.stock-updated events from inventory-service
 */
@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private kafka: Kafka;
  private consumer: Consumer;

  constructor(private readonly configService: ConfigService) {
    const broker = this.configService.get<string>('kafka.broker') || 'localhost:9092';
    const clientId = this.configService.get<string>('kafka.clientId') || 'cart-service';
    const groupId = this.configService.get<string>('kafka.groupId') || 'cart-service-group';

    this.logger.log(`Initializing Kafka Consumer - Broker: ${broker}`);

    this.kafka = new Kafka({
      clientId,
      brokers: [broker],
      logLevel: logLevel.INFO,
      retry: {
        retries: 8,
        initialRetryTime: 300,
        multiplier: 2,
      },
    });

    this.consumer = this.kafka.consumer({
      groupId,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });
  }

  async onModuleInit() {
    try {
      await this.consumer.connect();
      this.logger.log('✅ Kafka Consumer connected successfully');

      // Subscribe to inventory updates
      await this.consumer.subscribe({
        topic: 'inventory-stock-updated',
        fromBeginning: false,
      });

      this.logger.log('📥 Subscribed to: inventory-stock-updated');

      // Start consuming messages
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const value = message.value?.toString();
            if (!value) return;

            const event = JSON.parse(value) as InventoryStockUpdatedEvent;
            await this.handleInventoryStockUpdated(event);
          } catch (error) {
            this.logger.error('Error processing Kafka message', error);
          }
        },
      });

      this.logger.log('Kafka Consumer is now listening for messages');
    } catch (error) {
      this.logger.error('❌ Failed to start Kafka Consumer', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.consumer.disconnect();
      this.logger.log('Kafka Consumer disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting Kafka Consumer', error);
    }
  }

  /**
   * Handle inventory.stock-updated event
   * This can be used to notify users if items in their cart are out of stock
   */
  private async handleInventoryStockUpdated(
    event: InventoryStockUpdatedEvent,
  ): Promise<void> {
    this.logger.log(
      `📦 Inventory updated: Product ${event.productId} - Stock: ${event.availableStock}`,
    );

    // You can implement business logic here such as:
    // - Notify users if their cart items are out of stock
    // - Auto-remove out-of-stock items from carts
    // - Send push notifications
    
    if (event.availableStock === 0) {
      this.logger.warn(`⚠️ Product ${event.productId} is out of stock`);
      // TODO: Implement notification logic
    }
  }
}
