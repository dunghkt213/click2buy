// src/app.module.ts
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Inventory, InventorySchema } from './schemas/inventory.schemas';

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


    MongooseModule.forFeature([{ name: Inventory.name, schema: InventorySchema }]),

    // Kafka producer
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_PRODUCER',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'inventory-producer',
              brokers: ['click2buy_kafka:9092'],
            },
            consumer: {
              groupId: 'inventory-producer-group',
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

  onModuleInit() {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    console.log(
      `MongoDB state = ${states[this.connection.readyState]}`,
    );
  }
}
