import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest, JwtPayload } from '../types/jwt-payload.type.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
