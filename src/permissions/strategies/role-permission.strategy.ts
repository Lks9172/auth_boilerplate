import { Injectable } from '@nestjs/common';
import { RoleService } from '../../roles/application/role.service';
import { PermissionCheckStrategy } from './permission-check.strategy';

@Injectable()
export class RolePermissionStrategy implements PermissionCheckStrategy {
  constructor(private roleService: RoleService) {}

  async canAccess(userId: number, requiredPermissions: string[]): Promise<boolean> {
    try {
      // 사용자의 역할 ID를 가져와야 하지만, 현재는 userId만 받음
      // 실제 구현에서는 사용자 정보를 먼저 조회해야 함
      const rolePermissions = await this.roleService.getRolePermissions(userId);
      
      // 필요한 권한 중 하나라도 역할에 있으면 허용
      return requiredPermissions.some(permission => 
        rolePermissions.includes(permission)
      );
    } catch (error) {
      console.error('역할 권한 체크 중 오류:', error);
      return false;
    }
  }

  getStrategyName(): string {
    return 'RolePermission';
  }
}

