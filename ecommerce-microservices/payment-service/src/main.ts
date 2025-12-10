import { NestFactory } from '@nestjs/core';
import { PaymentModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(PaymentModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: { clientId: 'payment-service', brokers: ['click2buy_kafka:9092'] },
      consumer: { groupId: 'payment-service-consumer' },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3007);
}
bootstrap();

