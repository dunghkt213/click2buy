import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from './jwt.service';

@Injectable()
export class JwtKafkaAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) { }

  canActivate(context: ExecutionContext): boolean {
    console.log('📩 Incoming Kafka data:', context.switchToRpc().getData());
    // ✅ Dùng Nest helper lấy payload JSON đã parse sẵn
    const data = context.switchToRpc().getData();

    // 1️⃣ Lấy token từ field 'auth' hoặc 'authorization'
    const authHeader = data?.authorization || data?.auth;
    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization field in message');
    }

    // 2️⃣ Cắt chuỗi "Bearer "
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader;

    // 3️⃣ Validate và decode token
    const payload = this.jwtService.validateToken(token);
    if (!payload) {
      throw new UnauthorizedException('Invalid token');
    }

    // 4️⃣ Gắn payload vào data để controller dùng
    data.user = payload;

    return true;
  }
}
