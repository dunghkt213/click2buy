import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),

        ClientsModule.registerAsync([
            {
                name: 'MEDIA_SERVICE',
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: (config: ConfigService) => ({
                    transport: Transport.KAFKA,
                    options: {
                        client: {
                            clientId: 'media-service',
                            brokers: [config.get('KAFKA_BROKER')],
                        },
                        consumer: {
                            groupId: 'media-consumer',
                        },
                    },
                }),
            },
        ]),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
