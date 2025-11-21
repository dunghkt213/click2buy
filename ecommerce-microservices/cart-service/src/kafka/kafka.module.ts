import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaProducerService } from './kafka-producer.service';
import { KafkaConsumerService } from './kafka-consumer.service';

/**
 * Kafka Module
 * Provides Kafka producer and consumer services
 */
@Module({
  imports: [ConfigModule],
  providers: [KafkaProducerService, KafkaConsumerService],
  exports: [KafkaProducerService, KafkaConsumerService],
})
export class KafkaModule {}
