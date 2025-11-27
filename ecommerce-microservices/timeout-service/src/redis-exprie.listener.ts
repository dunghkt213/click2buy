import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import Redis from 'ioredis';

@Injectable()
export class RedisExpireListener implements OnModuleInit {
  private subscriber: Redis;
  private kafka: ClientKafka;

  constructor() {
    this.subscriber = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    });
    this.kafka = new ClientKafka({
      client: {
        brokers: ['click2buy_kafka:9092'],
      },
      consumer: {
        groupId: 'timeout-service-producer',
      },
    });
  }

  async onModuleInit() {
    await this.kafka.connect();
    console.log('🔌 Connected to Kafka broker');

    // Bật keyspace events
    await this.subscriber.config('SET', 'notify-keyspace-events', 'Ex');
    await this.subscriber.psubscribe('__keyevent@0__:expired');

    console.log('👂 Listening for Redis TTL expiration events...');

    this.subscriber.on('pmessage', (_, __, key) => {
      this.onKeyExpired(key);
    });
  }

  async onKeyExpired(key: string) {
    if (key.startsWith('order:') && key.endsWith(':paymentPending')) {
      const orderId = key.split(':')[1];

      console.log(`⏰ Order expired: ${orderId}`);
      console.log(`📤 Emitting event: order.timeout`);

      this.kafka.emit('order.timeout', { orderId });
    }
  }
}
