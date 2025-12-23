import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    const kafkaCtx = context.switchToRpc().getContext();
    const message = kafkaCtx.getMessage().value;
    return message.user; // payload đã được gắn trong guard
  },
);
