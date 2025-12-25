import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
    
    const app = await NestFactory.create(AppModule, { bodyParser: false });

    // Tăng body size limit cho image search (Base64 có thể lớn)
    // Mặc định: 100kb -> Tăng lên 10MB
    app.use(bodyParser.json({ limit: '10mb' }));
    app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

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