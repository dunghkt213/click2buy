import { Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtKafkaAuthGuard } from './jwt-kafka.guard';

@Module({
  providers: [JwtService, JwtAuthGuard, JwtKafkaAuthGuard],
  exports: [JwtService, JwtAuthGuard, JwtKafkaAuthGuard],
})
export class AuthModule {}
