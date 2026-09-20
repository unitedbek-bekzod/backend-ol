import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const isHttp = exception instanceof HttpException;
    const statusCode = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = isHttp ? exception.getResponse() : null;

    const message =
      body && typeof body === 'object' && 'message' in body
        ? (body as { message: unknown }).message
        : isHttp
          ? exception.message
          : 'Internal server error';

    const error =
      body && typeof body === 'object' && 'error' in body
        ? (body as { error: unknown }).error
        : HttpStatus[statusCode];

    if (!isHttp) {
      this.logger.error(exception instanceof Error ? exception.stack : exception);
    }

    response.status(statusCode).json({ statusCode, message, error });
  }
}
