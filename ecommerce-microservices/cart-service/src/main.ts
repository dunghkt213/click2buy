import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'cart-service',
        brokers: ['click2buy_kafka:9092'],
      },
      consumer: {
        groupId: 'cart-service-consumer',
      },
    },
  });

  await app.listen();
  
  logger.log('✅ Cart Service is running');
  logger.log('📡 Connected to Kafka broker');
  logger.log('🗄️  Connected to MongoDB');
  logger.log('🎧 Listening to Kafka topics: cart.get, cart.add, cart.update, cart.remove');
}

bootstrap();
