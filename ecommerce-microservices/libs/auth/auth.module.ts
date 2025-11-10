import { Global, Module } from '@nestjs/common';
import { JwtKafkaAuthGuard } from './jwt-kafka.guard';
import { JwtSharedService } from './jwt.service';
import { JwtSharedStrategy } from './jwt.strategy';

@Global()
@Module({
  providers: [
    JwtKafkaAuthGuard,
    JwtSharedService,
    JwtSharedStrategy,
  ],
  exports: [
    JwtKafkaAuthGuard,
    JwtSharedService,
    JwtSharedStrategy,
  ],
})
export class JwtSharedModule {}
