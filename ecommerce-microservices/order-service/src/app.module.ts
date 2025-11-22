import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Order, OrderSchema } from './schemas/order.schema';
import { redisProvider } from './redis.provider';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get('MONGO_URI'),
      }),
    }),

    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
    ]),

    ClientsModule.registerAsync([
      {
        name: 'KAFKA_PRODUCER',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'order-producer',
              brokers: ['click2buy_kafka:9092'],
            },
            consumer: {
              groupId: 'order-producer-group',
            },
          },
        }),
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService,redisProvider],
})
export class AppModule implements OnModuleInit {
  constructor(@InjectConnection() private readonly conn: Connection) {}

  onModuleInit() {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    console.log(`MongoDB Order state = ${states[this.conn.readyState]}`);
  }
}
