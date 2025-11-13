import { Body, Controller, Post } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common/decorators/core/inject.decorator';
import { LoginDto } from 'src/dtos/login.dto';
import { RegisterDto } from 'src/dtos/register.dto';
@Controller('auth')
export class AuthGateway {
  constructor(@Inject('KAFKA_SERVICE') private readonly kafka: ClientKafka) { }

  async onModuleInit() {
    this.kafka.subscribeToResponseOf('auth.login');
    this.kafka.subscribeToResponseOf('auth.register');
    await this.kafka.connect();
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    // -> auth-service @MessagePattern('auth.login')
    return this.kafka.send('auth.login', dto);
  }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    // -> auth-service @MessagePattern('auth.register')
    return this.kafka.send('auth.register', dto);
  }
}
