import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import cookieParser from 'cookie-parser';

async function bootstrap() {
    
    const app = await NestFactory.create(AppModule);

    
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