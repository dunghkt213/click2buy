import { Cart, CartSchema } from './schemas/cart.schema';
import { CartService } from './app.service';
import { CartController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';


@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get('MONGO_URI'),
      }),
    }),

    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
    ]),

    ClientsModule.registerAsync([
      {
        name: 'KAFKA_PRODUCER',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'cart-producer',
              brokers: ['click2buy_kafka:9092'],
            },
            consumer: {
              groupId: 'cart-producer-group',
            },
          },
        }),
      },
    ]),
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class AppModule implements OnModuleInit {
  constructor(@InjectConnection() private readonly conn: Connection) {}

  onModuleInit() {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    console.log(`MongoDB Cart state = ${states[this.conn.readyState]}`);
  }
}

