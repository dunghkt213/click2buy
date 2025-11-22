// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'inventory-service',
          brokers: ['click2buy_kafka:9092'],
        },
        consumer: {
          groupId: 'inventory-service-consumer',
        },
      },
    },
  );

  console.log('🚀 Inventory Service started...');
  await app.listen();
}

bootstrap();
