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
          clientId: 'order-service',
          brokers: ['click2buy_kafka:9092'],
        },
        consumer: {
          groupId: 'order-service-consumer',
        },
      },
    },
  );

  console.log('🚀 Order Service started');
  await app.listen();
}
bootstrap();
