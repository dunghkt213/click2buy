import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule, InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Product, ProductSchema } from '../schemas/product.schema';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';


@Module({
  imports: [

    ConfigModule.forRoot({ isGlobal: true }),


    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const uri = config.get<string>('MONGO_URI');
        console.log('🧩 Connecting to MongoDB:', uri);
        return {
          uri,
          serverSelectionTimeoutMS: 5000,
          retryWrites: true,
        };
      },
    }),


    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),

  
    ClientsModule.registerAsync([
      {
        name: 'PRODUCT_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (config: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'product-service',
              brokers: [config.get<string>('KAFKA_BROKER') || 'localhost:9092'],
            },
            consumer: {
              groupId: 'product-consumer',
            },
          },
        }),
      },
    ]),
  ],

  controllers: [AppController],
  providers: [AppService],
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
