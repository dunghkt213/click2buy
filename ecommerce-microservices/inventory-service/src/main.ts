import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  // 1. Tạo Hybrid Application (HTTP + Microservice)
  const app = await NestFactory.create(AppModule);
  
  // Lấy ConfigService để đọc biến môi trường
  const configService = app.get(ConfigService);

  // 2. Kết nối Kafka Microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: configService.get<string>('KAFKA_CLIENT_ID') || 'inventory-service',
        brokers: [configService.get<string>('KAFKA_BROKER') || 'kafka:9092'], // Đọc từ .env
      },
      consumer: {
        groupId: configService.get<string>('KAFKA_GROUP_ID') || 'inventory-service-consumer',
      },
    },
  });

  // 3. Khởi động Microservices
  await app.startAllMicroservices();

  // 4. Khởi động HTTP Server (Để test bằng Postman hoặc Gateway gọi sang)
  const port = configService.get<number>('PORT') || 3008;
  await app.listen(port);
  
  console.log(`🚀 Inventory Service is running on port ${port}`);
  console.log(`🚀 Kafka Consumer started for broker: ${configService.get('KAFKA_BROKER')}`);
}

bootstrap();