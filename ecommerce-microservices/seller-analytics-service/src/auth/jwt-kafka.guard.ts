import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { JwtService } from './jwt.service';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class JwtKafkaAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      // 1️⃣ Lấy Kafka message context
      const kafkaContext = context.switchToRpc().getContext();
      const message = kafkaContext.getMessage().value;

      if (!message) {
        throw new RpcException({
          statusCode: 400,
          message: 'Invalid Kafka message payload',
        });
      }

      // 2️⃣ Lấy token từ authorization / auth
      const authHeader = message.authorization || message.auth;
      if (!authHeader) {
        throw new RpcException({
          statusCode: 401,
          message: 'Missing authorization in Kafka message',
        });
      }

      // 3️⃣ Parse Bearer token
      const token = authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : authHeader;

      if (!token) {
        throw new RpcException({
          statusCode: 401,
          message: 'Invalid authorization header format',
        });
      }

      // 4️⃣ Validate JWT
      let payload: any;
      try {
        payload = this.jwtService.validateToken(token);
      } catch (err) {
        throw new RpcException({
          statusCode: 401,
          message: 'Invalid or expired token',
        });
      }

      // Hỗ trợ cả sub (JWT standard) và userId (custom)
      const userId = payload.sub || payload.userId || payload.id;
      if (!payload || !userId) {
        throw new RpcException({
          statusCode: 401,
          message: 'Invalid token payload',
        });
      }

      // 5️⃣ Inject user vào message để @CurrentUser đọc được (normalize)
      message.user = {
        ...payload,
        sub: userId,
        id: userId,
      };

      return true;
    } catch (err) {
      // 6️⃣ Convert mọi lỗi sang RpcException chuẩn
      if (err instanceof RpcException) {
        throw err;
      }

      throw new RpcException({
        statusCode: 401,
        message: err?.message || 'Unauthorized Kafka request',
      });
    }
  }
}
