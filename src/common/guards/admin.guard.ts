import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { AuthenticatedRequest } from '../types/jwt-payload.type.js';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (request.user?.subjectType !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    return true;
  }
}
