import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { KafkaContext } from '@nestjs/microservices';
import { JwtSharedStrategy } from './jwt.strategy';

@Injectable()
export class JwtKafkaAuthGuard implements CanActivate {
  constructor(private readonly jwtStrategy: JwtSharedStrategy) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = context.switchToRpc().getContext<KafkaContext>();
    const message = ctx.getMessage().value as any;

    const auth = message.auth;
    const user = this.jwtStrategy.extractUser(auth);


    message.user = user;

    return true;
  }
}
