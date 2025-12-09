import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as fs from "fs";
import * as path from "path";

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

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle("Seller Analytics Service API")
    .setDescription("API documentation cho Seller Analytics Service - Click2Buy E-commerce")
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT token",
        in: "header",
      },
      "JWT-auth", // Security name reference
    )
    .addTag("Analytics", "APIs thống kê doanh thu và sản phẩm cho Seller")
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Ghi swagger.json ra thư mục gốc để import vào Postman
  const swaggerPath = path.join(__dirname, "..", "swagger.json");
  fs.writeFileSync(swaggerPath, JSON.stringify(document, null, 2));
  console.log(`📄 Swagger JSON exported to: ${swaggerPath}`);

  // Setup Swagger UI tại /api/docs
  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Giữ token khi refresh
    },
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
    `📚 Swagger UI available at http://localhost:${port}/api/docs`,
  );
  console.log(
    `✅ Seller Analytics Service is listening to Kafka at ${kafkaBroker}`,
  );
}

bootstrap();
