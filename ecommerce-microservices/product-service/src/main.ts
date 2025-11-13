import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const broker = config.get('KAFKA_BROKER') || 'localhost:9092';

  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'product-service',
        brokers: [broker],
      },
      consumer: {
        groupId: 'product-consumer',
      },
    },
  });

  await app.startAllMicroservices();
  console.log('🚀 Product-service is now listening for Kafka messages...');
}
bootstrap();

//docker-compose up -d
//npm run start:dev
