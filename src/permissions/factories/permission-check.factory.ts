import { Injectable } from '@nestjs/common';
import { PermissionCheckStrategy } from '../strategies/permission-check.strategy';
import { DirectPermissionStrategy } from '../strategies/direct-permission.strategy';
import { RolePermissionStrategy } from '../strategies/role-permission.strategy';

export enum PermissionCheckType {
  DIRECT = 'direct',
  ROLE = 'role',
  HYBRID = 'hybrid',
}

@Injectable()
export class PermissionCheckFactory {
  constructor(
    private directPermissionStrategy: DirectPermissionStrategy,
    private rolePermissionStrategy: RolePermissionStrategy,
  ) {}

  createStrategy(type: PermissionCheckType): PermissionCheckStrategy {
    switch (type) {
      case PermissionCheckType.DIRECT:
        return this.directPermissionStrategy;
      case PermissionCheckType.ROLE:
        return this.rolePermissionStrategy;
      case PermissionCheckType.HYBRID:
        return new HybridPermissionStrategy(
          this.directPermissionStrategy,
          this.rolePermissionStrategy,
        );
      default:
        throw new Error(`Unknown permission check type: ${type}`);
    }
  }
}

// 하이브리드 전략 (OR 조건)
class HybridPermissionStrategy implements PermissionCheckStrategy {
  constructor(
    private directStrategy: DirectPermissionStrategy,
    private roleStrategy: RolePermissionStrategy,
  ) {}

  async canAccess(userId: number, requiredPermissions: string[]): Promise<boolean> {
    const [directResult, roleResult] = await Promise.all([
      this.directStrategy.canAccess(userId, requiredPermissions),
      this.roleStrategy.canAccess(userId, requiredPermissions),
    ]);

    return directResult || roleResult;
  }

  getStrategyName(): string {
    return 'HybridPermission';
  }
}

