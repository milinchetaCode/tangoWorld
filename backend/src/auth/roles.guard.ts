import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    const requiredStatus = this.reflector.getAllAndOverride<string[]>('status', [
      context.getHandler(),
      context.getClass(),
    ]);

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      return false;
    }

    // Check role if required
    if (requiredRoles && !requiredRoles.includes(user.role)) {
      return false;
    }

    // Check status if required (e.g., for organizer features)
    if (requiredStatus && !requiredStatus.includes(user.organizerStatus)) {
      return false;
    }

    return true;
  }
}
