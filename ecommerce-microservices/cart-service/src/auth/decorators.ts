import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator to extract userId from request
 * Usage: @GetUserId() userId: string
 */
export const GetUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.userId;
  },
);

/**
 * Custom decorator to extract entire user object from request
 * Usage: @GetUser() user: any
 */
export const GetUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
