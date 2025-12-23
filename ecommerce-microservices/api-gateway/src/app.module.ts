import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt'; // 👈 thêm
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthModule } from './auth/auth.module';
import { RequestLoggerMiddleware } from './common/middlewares/logger.middleware';
import { AuthGateway } from './gateways/auth.gateway';
import { CartGateway } from './gateways/cart.gateway';
import { ChatGateway } from './gateways/chat.gateway';
import { MediaGateway } from './gateways/media.gateway';
import { NotificationEventController } from './gateways/notification-event.controller';
import { NotificationGateway } from './gateways/notification.gateway';
import { OrderGateway } from './gateways/order.gateway';
import { PaymentWsGateway } from './gateways/payment-ws.gateway';
import { PaymentGateway } from './gateways/payment.gateway';
import { ProductGateway } from './gateways/product.gateway';
import { ReviewGateway } from './gateways/review.gateway';
import { SellerAnalyticsGateway } from './gateways/seller-analytics.gateway';
import { UserGateway } from './gateways/user.gateway';
import { AiImageGuard } from './guards/ai-image.guard';
import { AiReviewGuard } from './guards/ai-review.guard';
import { AiGuardModule } from './modules/ai-guard';
@Module({
  imports: [
    ConfigModule.forRoot(),

    HttpModule,

    AuthModule,

    AiGuardModule,

    // 👇 thêm JwtModule để Nest biết cung cấp JwtService cho SseController
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_secret',
      signOptions: { expiresIn: '7d' },
    }),

    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'api-gateway',
            brokers: ['click2buy_kafka:9092'],
          },
          consumer: {
            groupId: 'api-gateway-consumer',
          },
          subscribe: {
            fromBeginning: false,
          },
          producerOnlyMode: false,
        },
      },
    ]),
  ],

  controllers: [
    AuthGateway,
    UserGateway,
    ProductGateway,
    CartGateway,
    ReviewGateway,
    MediaGateway,
    SellerAnalyticsGateway,
    OrderGateway,
    PaymentGateway,
    NotificationEventController, // Controller để lắng nghe Kafka events
  ],

  providers: [
    AiReviewGuard,
    AiImageGuard,
    ChatGateway,
    PaymentWsGateway,
    NotificationGateway,
  ],
})
export class AppModule implements NestModule {
  constructor() {
    console.log("🔥 JWT_SECRET FROM ENV:", process.env.JWT_SECRET);
  }
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
