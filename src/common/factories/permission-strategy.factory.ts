import { Injectable } from '@nestjs/common';
import { PermissionCheckStrategy } from '../strategies/permission-check.strategy';
import { DirectPermissionStrategy } from '../strategies/direct-permission.strategy';
import { RolePermissionStrategy } from '../strategies/role-permission.strategy';

export enum PermissionStrategyType {
  DIRECT = 'direct',
  ROLE = 'role',
  HYBRID = 'hybrid',
  CUSTOM = 'custom',
}

@Injectable()
export class PermissionStrategyFactory {
  constructor(
    private directPermissionStrategy: DirectPermissionStrategy,
    private rolePermissionStrategy: RolePermissionStrategy,
  ) {}

  createStrategy(type: PermissionStrategyType): PermissionCheckStrategy {
    switch (type) {
      case PermissionStrategyType.DIRECT:
        return this.directPermissionStrategy;
      case PermissionStrategyType.ROLE:
        return this.rolePermissionStrategy;
      case PermissionStrategyType.HYBRID:
        return new HybridPermissionStrategy(
          this.directPermissionStrategy,
          this.rolePermissionStrategy,
        );
      default:
        throw new Error(`Unknown permission strategy type: ${type}`);
    }
  }

  // 모든 전략을 우선순위별로 정렬하여 반환
  getAllStrategies(): PermissionCheckStrategy[] {
    return [
      this.directPermissionStrategy,
      this.rolePermissionStrategy,
    ].sort((a, b) => a.getPriority() - b.getPriority());
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

    const result = directResult || roleResult;
    console.log(`🔀 Hybrid permission check for user ${userId}: ${result} (direct: ${directResult}, role: ${roleResult})`);
    return result;
  }

  getStrategyName(): string {
    return 'HybridPermission';
  }

  getPriority(): number {
    return 3; // 세 번째 우선순위
  }
}
