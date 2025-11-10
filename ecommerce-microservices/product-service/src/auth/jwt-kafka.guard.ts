import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from './jwt.service';

@Injectable()
export class JwtKafkaAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    // 1️⃣ Lấy Kafka message context
    const kafkaContext = context.switchToRpc().getContext();
    const message = kafkaContext.getMessage().value;

    // 2️⃣ Lấy token từ field 'authorization' trong message
    const authHeader = message?.authorization || message?.auth;
    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization field in message');
    }

    // 3️⃣ Cắt chuỗi Bearer token
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader;

    // 4️⃣ Validate và lấy payload
    const payload = this.jwtService.validateToken(token);

    // 5️⃣ Gắn payload vào message để handler dùng được
    message.user = payload;
    return true;
  }
}
