// src/payment.module.ts
import { Module, OnModuleInit} from '@nestjs/common';
import { MongooseModule, InjectConnection} from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { PaymentService } from './app.service';
import { PaymentController } from './app.controller';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { Connection } from 'mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
@Module({
  imports: [
    // 1️⃣ Load biến môi trường toàn cục (.env)
    ConfigModule.forRoot({ isGlobal: true }),

    // 2️⃣ Kết nối MongoDB trước khi đăng ký model
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const uri =
          config.get<string>('MONGO_URI');
        console.log('🧩 Connecting to MongoDB:', uri);
        return {
          uri,
          serverSelectionTimeoutMS: 5000,
          retryWrites: true,
        };
      },
    }),

    // 3️⃣ Sau khi có connection, mới đăng ký schema
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),

    ClientsModule.registerAsync([
      {
        name: 'KAFKA_PRODUCER',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (config: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'payment-producer',
              brokers: ['click2buy_kafka:9092'],
            },
            consumer: {
              groupId: 'payment-producer-group',
            },
          },
        }),
      },
    ]),
  ],

  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule implements OnModuleInit {
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