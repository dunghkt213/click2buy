import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, logLevel } from 'kafkajs';
import {
  InventoryReserveEvent,
  InventoryUpdateReservationEvent,
  OrderCreateEvent,
} from './kafka.interfaces';

/**
 * Kafka Producer Service
 * Publishes events to inventory-service and order-service
 */
@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private kafka: Kafka;
  private producer: Producer;

  constructor(private readonly configService: ConfigService) {
    const broker = this.configService.get<string>('kafka.broker') || 'localhost:9092';
    const clientId = this.configService.get<string>('kafka.clientId') || 'cart-service';

    this.logger.log(`Initializing Kafka Producer - Broker: ${broker}`);

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

    this.producer = this.kafka.producer({
      allowAutoTopicCreation: true,
      transactionTimeout: 30000,
    });
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      this.logger.log('✅ Kafka Producer connected successfully');
    } catch (error) {
      this.logger.error('❌ Failed to connect Kafka Producer', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.producer.disconnect();
      this.logger.log('Kafka Producer disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting Kafka Producer', error);
    }
  }

  /**
   * Generic method to send messages to Kafka
   */
  private async sendMessage(topic: string, message: any): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            value: JSON.stringify(message),
            timestamp: Date.now().toString(),
          },
        ],
      });
      this.logger.log(`📤 Published to ${topic}: ${message.event}`);
    } catch (error) {
      this.logger.error(`Failed to publish to ${topic}`, error);
      throw error;
    }
  }

  /**
   * Publish inventory.reserve event
   * Called when user adds items to cart
   */
  async publishInventoryReserve(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<void> {
    const event: InventoryReserveEvent = {
      event: 'inventory.reserve',
      userId,
      productId,
      quantity,
      timestamp: new Date().toISOString(),
    };

    await this.sendMessage('inventory-events', event);
  }

  /**
   * Publish inventory.update-reservation event
   * Called when user updates cart item quantity
   */
  async publishInventoryUpdateReservation(
    userId: string,
    productId: string,
    oldQuantity: number,
    newQuantity: number,
  ): Promise<void> {
    const event: InventoryUpdateReservationEvent = {
      event: 'inventory.update-reservation',
      userId,
      productId,
      oldQuantity,
      newQuantity,
      timestamp: new Date().toISOString(),
    };

    await this.sendMessage('inventory-events', event);
  }

  /**
   * Publish order.create event
   * Called when user checks out
   */
  async publishOrderCreate(
    userId: string,
    items: Array<{ productId: string; quantity: number }>,
  ): Promise<void> {
    const event: OrderCreateEvent = {
      event: 'order.create',
      userId,
      items,
      timestamp: new Date().toISOString(),
    };

    await this.sendMessage('order-events', event);
  }
}
