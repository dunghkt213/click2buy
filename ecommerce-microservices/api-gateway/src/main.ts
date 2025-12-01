import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import * as yaml from 'yaml';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.use(cookieParser());

    app.enableCors({
        origin: ['http://localhost:5173'],
        credentials: true,
    });

    // KAFKA
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

    // 🚀 Swagger config
    const config = new DocumentBuilder()
        .setTitle('Click2Buy - API Gateway')
        .setDescription('API Gateway for Click2Buy microservices.')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);

    // UI: http://localhost:3000/docs
    SwaggerModule.setup('docs', app, document);

    // 🔥 Export OpenAPI YAML file
    const yamlString = yaml.stringify(document);
    writeFileSync('./openapi/openapi.yaml', yamlString);

    console.log("📄 OpenAPI exported → ./openapi/openapi.yaml");
    SwaggerModule.setup('docs', app, document);

    // Start HTTP + Kafka
    await app.startAllMicroservices();
    await app.listen(3000);

    console.log('🚀 API Gateway running at http://localhost:3000');
    console.log('📘 Swagger UI available at http://localhost:3000/docs');
}
bootstrap();
