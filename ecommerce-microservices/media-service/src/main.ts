import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // HTTP server cho FE upload
    await app.listen(process.env.PORT || 3005);
    console.log('HTTP server running on port', process.env.PORT || 3005);

    // Kafka microservice cho validation
    const kafkaApp = app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.KAFKA,
        options: {
            client: { brokers: [process.env.KAFKA_BROKER] },
            consumer: { groupId: 'media-consumer' },
        },
    });

    await app.startAllMicroservices();
    console.log('Kafka consumer connected (media-service)');
}

bootstrap();
