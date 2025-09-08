import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';

export interface PermissionCheckContext {
  userId: number;
  requiredPermissions: string[];
  userRoles: Role[];
  userDirectPermissions: string[];
}

export interface PermissionCheckResult {
  hasPermission: boolean;
  reason: string;
  checkedPermissions: string[];
  matchedPermissions: string[];
}

@Injectable()
export class PermissionDomainService {
  /**
   * 사용자의 권한을 검사합니다 (도메인 로직)
   */
  checkUserPermissions(context: PermissionCheckContext): PermissionCheckResult {
    const { requiredPermissions, userRoles, userDirectPermissions } = context;
    
    // 1. 직접 권한 확인
    const directPermissionMatches = requiredPermissions.filter(permission =>
      userDirectPermissions.includes(permission)
    );

    if (directPermissionMatches.length > 0) {
      return {
        hasPermission: true,
        reason: '직접 권한 보유',
        checkedPermissions: requiredPermissions,
        matchedPermissions: directPermissionMatches,
      };
    }

    // 2. 역할 기반 권한 확인
    const rolePermissionMatches: string[] = [];
    
    for (const role of userRoles) {
      if (!role.isActive) continue;
      
      const rolePermissions = this.getRolePermissionsIncludingHierarchy(role, userRoles);
      
      for (const permission of requiredPermissions) {
        if (rolePermissions.includes(permission) && !rolePermissionMatches.includes(permission)) {
          rolePermissionMatches.push(permission);
        }
      }
    }

    if (rolePermissionMatches.length > 0) {
      return {
        hasPermission: true,
        reason: '역할 기반 권한 보유',
        checkedPermissions: requiredPermissions,
        matchedPermissions: rolePermissionMatches,
      };
    }

    return {
      hasPermission: false,
      reason: '권한 없음',
      checkedPermissions: requiredPermissions,
      matchedPermissions: [],
    };
  }

  /**
   * 역할의 모든 권한을 가져옵니다 (계층 구조 포함)
   */
  private getRolePermissionsIncludingHierarchy(role: Role, allRoles: Role[]): string[] {
    const permissions = [...role.permissionIds];
    
    // 부모 역할의 권한도 포함
    if (role.parentId) {
      const parentRole = allRoles.find(r => r.id === role.parentId);
      if (parentRole && parentRole.isActive) {
        permissions.push(...this.getRolePermissionsIncludingHierarchy(parentRole, allRoles));
      }
    }
    
    return [...new Set(permissions)]; // 중복 제거
  }

  /**
   * 사용자가 특정 역할을 가지고 있는지 확인합니다
   */
  userHasRole(user: User, roleId: number): boolean {
    return user.hasRole(roleId);
  }

  /**
   * 사용자가 특정 권한을 가지고 있는지 확인합니다
   */
  userHasPermission(
    user: User, 
    permissionId: string, 
    userRoles: Role[], 
    userDirectPermissions: string[]
  ): boolean {
    // 직접 권한 확인
    if (userDirectPermissions.includes(permissionId)) {
      return true;
    }

    // 역할 기반 권한 확인
    for (const role of userRoles) {
      if (!role.isActive) continue;
      
      if (role.hasPermission(permissionId)) {
        return true;
      }
    }

    return false;
  }
}

