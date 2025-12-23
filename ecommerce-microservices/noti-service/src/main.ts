import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('NotificationService');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'notification-service',
          brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
        },
        consumer: {
          groupId: 'notification-consumer-group',
        },
      },
    },
  );

  await app.listen();
  logger.log('🚀 Notification Service is running');
  logger.log(`📡 Kafka: ${process.env.KAFKA_BROKER}`);
  logger.log('📨 Listening topics:');
  logger.log(' - noti.create');
  logger.log(' - noti.findByUser');
  logger.log(' - noti.markAsRead');
  logger.log(' - noti.unreadCount');
}

bootstrap();
