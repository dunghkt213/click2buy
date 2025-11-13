"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const microservices_1 = require("@nestjs/microservices");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: ['http://localhost:5173'],
        credentials: true,
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Review Service')
        .setDescription('API documentation for Review microservice (Click2Buy)')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    app.connectMicroservice({
        transport: microservices_1.Transport.KAFKA,
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
//# sourceMappingURL=main.js.map