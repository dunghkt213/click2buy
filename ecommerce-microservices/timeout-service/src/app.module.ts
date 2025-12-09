import { Module } from '@nestjs/common';
import { RedisExpireListener } from './redis-exprie.listener';

@Module({
  providers: [RedisExpireListener],
})
export class AppModule {}
