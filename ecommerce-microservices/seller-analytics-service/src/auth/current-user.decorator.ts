import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    // Kiểm tra context type để hỗ trợ cả HTTP và Kafka
    const contextType = context.getType();

    if (contextType === 'http') {
      const request = context.switchToHttp().getRequest();
      return request.user;
    }

    // Kafka context
    const kafkaCtx = context.switchToRpc().getContext();
    const message = kafkaCtx.getMessage().value;
    return message.user;
  },
);
