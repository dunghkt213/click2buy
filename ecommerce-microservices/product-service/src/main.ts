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
          clientId: 'product-service',
          brokers: ['click2buy_kafka:9092'],
        },
        consumer: {
          groupId: 'product-consumer-group',
        },
      },
    },
  );

  await app.listen();
  console.log('✅ Product Service is listening to Kafka at click2buy_kafka:9092');
}
bootstrap();