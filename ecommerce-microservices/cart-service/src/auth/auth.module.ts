import { Module } from '@nestjs/common';
import { JwtAuthService } from './jwt-auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

/**
 * Auth Module
 * Provides JWT authentication services
 */
@Module({
  providers: [JwtAuthService, JwtAuthGuard],
  exports: [JwtAuthService, JwtAuthGuard],
})
export class AuthModule {}
