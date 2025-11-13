"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const microservices_1 = require("@nestjs/microservices");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const config = app.get(config_1.ConfigService);
    const broker = config.get('KAFKA_BROKER') || 'localhost:9092';
    app.connectMicroservice({
        transport: microservices_1.Transport.KAFKA,
        options: {
            client: {
                clientId: 'product-service',
                brokers: [broker],
            },
            consumer: {
                groupId: 'product-consumer',
            },
        },
    });
    await app.startAllMicroservices();
    console.log('🚀 Product-service is now listening for Kafka messages...');
}
bootstrap();
//# sourceMappingURL=main.js.map