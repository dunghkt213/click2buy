import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {

    const app = await NestFactory.create(AppModule, { bodyParser: false });


    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ limit: '50mb', extended: true }));


    app.use(cookieParser());

    app.enableCors({
        origin: ['http://localhost:5173'],
        credentials: true,
    });

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.KAFKA,
        options: {
            client: {
                clientId: 'api-gateway',
                brokers: ['click2buy_kafka:9092'],
            },
            consumer: {
                groupId: 'api-gateway-consumer',
            },
        },
    });

    // 🚀 Start cả HTTP và Kafka song song
    await app.startAllMicroservices();
    await app.listen(3000);

    console.log('✅ API Gateway is running on http://localhost:3000');
}
bootstrap();