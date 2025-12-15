import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('ChatService');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'chat-service',
          brokers: [process.env.KAFKA_BROKER || 'click2buy_kafka:9092'],
        },
        consumer: {
          groupId: 'chat-consumer-group',
        },
      },
    },
  );

  // Graceful shutdown
  app.enableShutdownHooks();

  await app.listen();
  
  logger.log('✅ Chat Service is listening to Kafka');
  logger.log(`📡 Kafka Broker: ${process.env.KAFKA_BROKER || 'click2buy_kafka:9092'}`);
  logger.log('📨 Subscribed patterns:');
  logger.log('   - chat.message.send (EventPattern)');
  logger.log('   - chat.conversation.findOrCreate (MessagePattern)');
  logger.log('   - chat.message.findByConversation (MessagePattern)');
  logger.log('   - chat.conversation.findByUser (MessagePattern)');
  logger.log('   - chat.message.markAsRead (MessagePattern)');
  logger.log('   - chat.message.unreadCount (MessagePattern)');
}

bootstrap();
