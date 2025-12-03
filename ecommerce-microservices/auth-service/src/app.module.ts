import { Module, Inject, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TokenModule } from './token/token.module';
import { OtpModule } from './otp/otp.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>('MONGO_URI');
        console.log('🧩 MONGO_URI:', uri);
        return { uri };
      },
      inject: [ConfigService],
    }),

    TokenModule,
    OtpModule,
    ClientsModule.register([
  {
    name: 'AUTH_SERVICE',
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'auth-service',
        brokers: ['click2buy_kafka:9092'],
      },
      consumer: {
        groupId: 'auth-service-consumer',
      },
    },
  },
])
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onModuleInit() {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    console.log(`🧠 MongoDB connection state: ${states[this.connection.readyState]}`);
  }
}
