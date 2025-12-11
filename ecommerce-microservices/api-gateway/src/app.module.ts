import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt'; // 👈 thêm

import { AuthGateway } from './gateways/auth.gateway';
import { UserGateway } from './gateways/user.gateway';
import { ProductGateway } from './gateways/product.gateway';
import { CartGateway } from './gateways/cart.gateway';
import { ReviewGateway } from './gateways/review.gateway';
import { MediaGateway } from './gateways/media.gateway';
import { SellerAnalyticsGateway } from './gateways/seller-analytics.gateway';
import { AuthModule } from './auth/auth.module';
import { AiGuardModule } from './modules/ai-guard';

import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { RequestLoggerMiddleware } from './common/middlewares/logger.middleware';
import { OrderGateway } from './gateways/order.gateway';
import { PaymentGateway } from './gateways/payment.gateway';
import { SseService } from './gateways/sse/sse.service';
import { SseController } from './gateways/sse/sse.controller';
import { AiReviewGuard } from './guards/ai-review.guard';
import { ChatGateway } from './gateways/chat.gateway';

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
    SseController, // 👈 vẫn giữ nguyên
  ],

  providers: [
    AiReviewGuard,
    ChatGateway,
    SseService, // 👈 vẫn giữ nguyên
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
