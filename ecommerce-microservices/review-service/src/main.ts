import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);


  app.enableCors({
    origin: ['http://localhost:5173'], 
    credentials: true,
  });


  const config = new DocumentBuilder()
    .setTitle('Review Service')
    .setDescription('API documentation for Review microservice (Click2Buy)')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // → http://localhost:3004/api

  // 🔗 3️⃣ Kết nối Kafka
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'review-service',
        brokers: [process.env.KAFKA_BROKER || 'click2buy_kafka:9092'],
      },
      consumer: {
        groupId: 'review-consumer',
      },
    },
  });

 
  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3004);

  console.log(`✅ Review Service is running on port ${process.env.PORT || 3004}`);
  console.log('💬 Listening for Kafka messages on topic review.*');
  console.log(`📘 Swagger Docs: http://localhost:${process.env.PORT || 3004}/api`);
}

bootstrap();
