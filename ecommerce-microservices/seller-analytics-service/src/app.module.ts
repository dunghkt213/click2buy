import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

import {
  DailyRevenue,
  DailyRevenueSchema,
} from './schemas/daily-revenue.schema';
import {
  ProductAnalytics,
  ProductAnalyticsSchema, 
} from './schemas/product-analytics.schema';

import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './controllers/analytics.controller';
import { KafkaConsumerController } from './controllers/kafka-consumer.controller';

/**
 * App Module cho Seller Analytics Service
 * - Kết nối MongoDB để lưu trữ OrderSnapshot và DailyRevenue
 * - Kết nối Kafka để lắng nghe events và emit events
 * - Cung cấp HTTP API cho Dashboard và Seller operations
 */
@Module({
  imports: [
    // 1️⃣ Load biến môi trường toàn cục (.env)
    ConfigModule.forRoot({ isGlobal: true }),

    // 2️⃣ Kết nối MongoDB - SỬ DỤNG ConfigService để tránh lỗi uri undefined
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const uri = config.get<string>('MONGO_URI');
        if (!uri) {
          throw new Error('MONGO_URI is not defined in environment variables');
        }
        console.log('🧩 Connecting to MongoDB:', uri);
        return {
          uri,
          serverSelectionTimeoutMS: 5000,
          retryWrites: true,
        };
      },
    }),

    // 3️⃣ Đăng ký MongoDB schemas
    MongooseModule.forFeature([
      { name: DailyRevenue.name, schema: DailyRevenueSchema },
      { name: ProductAnalytics.name, schema: ProductAnalyticsSchema },
    ]),
  ],

  controllers: [
    AnalyticsController,
    KafkaConsumerController, // Kafka consumer controller
  ],

  providers: [AnalyticsService],
})
export class AppModule implements OnModuleInit {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onModuleInit() {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    console.log(
      `🧠 MongoDB connection state: ${states[this.connection.readyState]}`,
    );

    this.connection.on('connected', () =>
      console.log('✅ MongoDB connected successfully'),
    );
    this.connection.on('error', (err) =>
      console.error('❌ MongoDB connection error:', err.message),
    );
  }
}

