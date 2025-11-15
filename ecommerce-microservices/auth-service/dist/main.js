"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const microservices_1 = require("@nestjs/microservices");
async function bootstrap() {
    const app = await core_1.NestFactory.createMicroservice(app_module_1.AppModule, {
        transport: microservices_1.Transport.KAFKA,
        options: {
            client: {
                clientId: 'auth-service',
                brokers: ['click2buy_kafka:9092'],
            },
            consumer: {
                groupId: 'auth-consumer-group',
            },
        },
    });
    await app.listen();
    console.log('✅ Auth Service is running and connected to Kafka');
}
bootstrap();
//# sourceMappingURL=main.js.map