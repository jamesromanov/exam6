import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { ThrottlerException } from '@nestjs/throttler';
import { ValidationError } from 'class-validator';
import { Request, Response } from 'express';
import { GraphQLError } from 'graphql';
import {
  CannotCreateEntityIdMapError,
  EntityNotFoundError,
  EntityPropertyNotFoundError,
  QueryFailedError,
} from 'typeorm';

@Catch()
export class GlobalFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const ctxType = GqlArgumentsHost.create(host);

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = (exception as any).message.message
      ? (exception as any).message.message
      : (exception as any).message;

    switch (exception?.constructor) {
      case HttpException:
        status = (exception as HttpException).getStatus();
        break;
      case QueryFailedError:
        message = (exception as QueryFailedError).message;
        status = HttpStatus.UNPROCESSABLE_ENTITY;
        break;
      case EntityNotFoundError:
        message = (exception as EntityNotFoundError).message;
        status = HttpStatus.UNPROCESSABLE_ENTITY;
        break;
      case CannotCreateEntityIdMapError:
        message = (exception as CannotCreateEntityIdMapError).message;
        status = HttpStatus.UNPROCESSABLE_ENTITY;
        break;
      case ThrottlerException:
        status = (exception as ThrottlerException).getStatus();
        message = (exception as any).message;
        break;
      case ValidationError:
        message = (exception as any).response.message;
        status = (exception as any).status;
        break;
      case EntityPropertyNotFoundError:
        message = (exception as any).message;
        status = (exception as any).status;
        break;
      default:
        status = (exception as any).status || HttpStatus.INTERNAL_SERVER_ERROR;
        message = (exception as any).response.message || message;
    }

    return ctxType.getInfo()
      ? new GraphQLError(message)
      : response.status(status).json({
          success: false,
          statusCode: status,
          message,
          timestamp: new Date().toISOString(),
          path: request.url,
        });
  }
}
