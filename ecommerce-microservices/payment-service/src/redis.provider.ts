// src/redis.provider.ts
import Redis from 'ioredis';

export const redisProviders = [
  {
    provide: 'REDIS_CLIENT',
    useFactory: () => {
      return new Redis({
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      });
    },
  },
  {
    provide: 'REDIS_SUBSCRIBER',
    useFactory: () => {
      const sub = new Redis({
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      });

      // Enable keyspace notifications
      sub.config('SET', 'notify-keyspace-events', 'Ex');
      return sub;
    },
  },
];
