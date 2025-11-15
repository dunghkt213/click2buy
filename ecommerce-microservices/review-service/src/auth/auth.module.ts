// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { JwtKafkaAuthGuard } from './jwt-kafka.guard';

@Module({
    providers: [JwtService, JwtKafkaAuthGuard],
    exports: [JwtService, JwtKafkaAuthGuard],
})
export class AuthModule { }
