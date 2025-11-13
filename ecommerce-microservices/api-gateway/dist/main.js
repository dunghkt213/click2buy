"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const microservices_1 = require("@nestjs/microservices");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    // 🚀 Tạo HTTP server (API Gateway)
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // 🧁 Cho phép đọc cookie (JWT, session, v.v.)
    const cookieParser = require('cookie-parser');
    app.use(cookieParser());
    // 🌐 Cho phép CORS (FE có thể gửi cookie)
    app.enableCors({
        origin: ['http://localhost:5173'], // 👈 FE domain
        credentials: true,
    });
    // 🔗 Kết nối với Kafka microservices
    app.connectMicroservice({
        transport: microservices_1.Transport.KAFKA,
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
    // ⚡ Swagger chỉ cần ở Gateway
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Click2Buy API Gateway')
        .setDescription('Unified API documentation for all microservices')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document); // 👉 http://localhost:3000/api
    // 🚀 Start cả HTTP và Kafka song song
    await app.startAllMicroservices();
    await app.listen(3000);
    console.log('✅ API Gateway is running on http://localhost:3000');
    console.log('📘 Swagger Docs available at http://localhost:3000/api');
}
bootstrap();
//# sourceMappingURL=main.js.map