import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Kafka, Producer, Consumer, EachMessagePayload } from 'kafkajs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private readonly logger = new Logger(KafkaService.name);

  constructor(private configService: ConfigService) {
    const broker = this.configService.get<string>('KAFKA_BROKER') || 'click2buy_kafka:9092';
    const clientId = this.configService.get<string>('KAFKA_CLIENT_ID') || 'cart-service';
    const groupId = this.configService.get<string>('KAFKA_GROUP_ID') || 'cart-service-group';

    this.kafka = new Kafka({
      clientId,
      brokers: [broker],
      retry: {
        initialRetryTime: 300,
        retries: 10,
      },
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId });
  }

  async onModuleInit() {
    try {
      await this.connectWithRetry();
    } catch (error) {
      this.logger.error('Failed to connect to Kafka after retries:', error);
      // Don't throw - let the app start anyway
    }
  }

  private async connectWithRetry(maxRetries = 10, delay = 2000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        this.logger.log(`Attempting to connect to Kafka (attempt ${i + 1}/${maxRetries})...`);
        await this.producer.connect();
        await this.consumer.connect();
        this.logger.log('✅ Kafka Producer and Consumer connected');
        return;
      } catch (error) {
        this.logger.warn(`Failed to connect to Kafka (attempt ${i + 1}/${maxRetries}):`, error.message);
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
  }

  async onModuleDestroy() {
    try {
      await this.producer.disconnect();
      await this.consumer.disconnect();
      this.logger.log('🔌 Kafka Producer and Consumer disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting from Kafka:', error);
    }
  }

  async sendMessage(topic: string, message: any) {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            value: JSON.stringify(message),
          },
        ],
      });
      this.logger.log(`📤 Message sent to topic ${topic}`);
    } catch (error) {
      this.logger.error(`❌ Error sending message to ${topic}:`, error);
      throw error;
    }
  }

  async subscribe(topics: string[], callback: (payload: EachMessagePayload) => Promise<void>) {
    try {
      await this.consumer.subscribe({ topics, fromBeginning: false });
      this.logger.log(`📥 Subscribed to topics: ${topics.join(', ')}`);

      await this.consumer.run({
        eachMessage: callback,
      });
    } catch (error) {
      this.logger.error('❌ Error in Kafka consumer:', error);
      throw error;
    }
  }
}
