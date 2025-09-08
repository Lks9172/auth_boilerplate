import { Injectable } from '@nestjs/common';
import { RoleService } from '../../roles/application/role.service';
import { PermissionCheckStrategy } from './permission-check.strategy';

@Injectable()
export class RolePermissionStrategy implements PermissionCheckStrategy {
  constructor(private roleService: RoleService) {}

  async canAccess(userId: number, requiredPermissions: string[]): Promise<boolean> {
    try {
      // 사용자 정보 조회 (실제로는 UserService를 통해 조회해야 함)
      const user = await this.getUserWithRole(userId);
      if (!user?.role?.id) {
        console.log(`👤 User ${userId} has no role assigned`);
        return false;
      }

      const rolePermissions = await this.roleService.getRolePermissions(user.role.id);
      const result = requiredPermissions.some(permission => 
        rolePermissions.includes(permission)
      );

      console.log(`👑 Role permission check for user ${userId} (role ${user.role.id}): ${result}`);
      return result;
    } catch (error) {
      console.error('❌ Role permission check failed:', error);
      return false;
    }
  }

  getStrategyName(): string {
    return 'RolePermission';
  }

  getPriority(): number {
    return 2; // 두 번째 우선순위
  }

  private async getUserWithRole(userId: number): Promise<any> {
    // 실제로는 UserService를 통해 조회해야 함
    return { id: userId, role: { id: 1 } }; // Admin 역할 가정
  }
}
