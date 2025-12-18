import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { MongooseModule, InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Conversation, ConversationSchema } from './schemas/conversation.schema.js';
import { Message, MessageSchema } from './schemas/message.schema.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    
    // MongoDB Connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
      }),
    }),

    // Register Schemas
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
    ]),

    // Kafka Client (để emit events nếu cần)
    ClientsModule.registerAsync([
      {
        name: 'CHAT_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (config: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'chat-service',
              brokers: [config.get<string>('KAFKA_BROKER') || 'localhost:9092'],
            },
            consumer: {
              groupId: 'chat-consumer',
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
  private readonly logger = new Logger(AppModule.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onModuleInit() {
    this.connection.on('connected', () => {
      this.logger.log('✅ MongoDB connected');
    });
    
    this.connection.on('error', (err) => {
      this.logger.error(`❌ MongoDB error: ${err.message}`);
    });

    this.connection.on('disconnected', () => {
      this.logger.warn('⚠️ MongoDB disconnected');
    });
  }
}
