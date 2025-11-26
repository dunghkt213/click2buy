import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";

/**
 * Bootstrap function cho Seller Analytics Service
 * Service này vừa là HTTP server (cho API Dashboard) vừa là Kafka microservice (để lắng nghe events)
 */
async function bootstrap() {
  // Tạo HTTP application
  const app = await NestFactory.create(AppModule);

  // Enable CORS (nếu cần)
  app.enableCors({
    origin: ["http://localhost:5173"], // Frontend URL
    credentials: true,
  });

  // Kết nối Kafka microservice để lắng nghe events
  const kafkaBroker = process.env.KAFKA_BROKER || "kafka:9092";

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: "seller-analytics-service",
        brokers: [kafkaBroker],
      },
      consumer: {
        groupId: "seller-analytics-consumer-group",
      },
    },
  });

  // Start cả HTTP server và Kafka microservice
  await app.startAllMicroservices();

  const port = process.env.PORT || 3009;
  await app.listen(port);

  console.log(
    `✅ Seller Analytics Service is running on http://localhost:${port}`,
  );
  console.log(
    `✅ Seller Analytics Service is listening to Kafka at ${kafkaBroker}`,
  );
}

bootstrap();
