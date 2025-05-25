import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { ROLES_KEY } from 'src/auth/roles.key';
import { UserRole } from 'src/users/user.role';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );
      if (!requiredRoles) return false;

      const { user } =
        GqlExecutionContext.create(context).getContext().req ||
        context.switchToHttp().getRequest<Request>();

      if (!requiredRoles.includes(user.role))
        throw new UnauthorizedException('You dont have rights to do that');
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
    return true;
  }
}
