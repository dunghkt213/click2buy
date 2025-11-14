import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule  } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductModule } from './product/product.model';
import { AuthModule } from './auth/auth.module';
import { ReviewModule } from './review/review.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DB_URI'),
        connectionFactory: (connection) => {
          console.log('✅ MongoDB connected:', connection.name);
          connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
          });
          connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected');
          });
          return connection;
        },
      }),
    }),

    UserModule , ProductModule , AuthModule, ReviewModule, CartModule, OrderModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
