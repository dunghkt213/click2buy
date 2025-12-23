import { Module, OnModuleInit, Logger, Inject } from '@nestjs/common';
import { MongooseModule, InjectConnection } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { NotificationController } from './app.controller';
import { NotificationService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get('MONGO_URI'),
      }),
    }),

    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),

    ClientsModule.registerAsync([
      {
        name: 'NOTIFICATION_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'notification-service',
              brokers: [config.get<string>('KAFKA_BROKER') || 'localhost:9092'],
            },
            consumer: {
              groupId: 'notification-consumer-group',
            },
          },
        }),
      },
    ]),
  ],

  controllers: [NotificationController],
  providers: [NotificationService],
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
