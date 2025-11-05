import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { KafkaContext } from '@nestjs/microservices';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const kafkaCtx = ctx.switchToRpc().getContext<KafkaContext>();
    const message = kafkaCtx.getMessage().value as any;
    return message.user;
  },
);

