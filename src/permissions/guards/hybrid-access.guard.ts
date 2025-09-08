import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionCheckService } from '../../common/services/permission-check.service';

@Injectable()
export class HybridAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionCheckService: PermissionCheckService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // 1. 필요한 역할들 체크
    const requiredRoles = this.reflector.getAllAndOverride<number[]>('roles', [
      context.getClass(),
      context.getHandler(),
    ]);

    // 2. 필요한 권한들 체크
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getClass(),
      context.getHandler(),
    ]);

    // 역할과 권한 둘 다 없으면 접근 허용
    if (!requiredRoles?.length && !requiredPermissions?.length) {
      return true;
    }

    // 권한이 요구되는 경우
    if (requiredPermissions?.length) {
      const hasPermission = await this.permissionCheckService.checkPermissions(
        user.id, 
        requiredPermissions
      );
      if (hasPermission) {
        return true;
      }
    }

    // 역할이 요구되는 경우 (권한 없이 역할만 체크)
    if (requiredRoles?.length && !requiredPermissions?.length) {
      return requiredRoles.includes(user.role?.id);
    }

    return false;
  }

}
