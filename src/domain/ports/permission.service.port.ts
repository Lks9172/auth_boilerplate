import { PermissionCheckContext, PermissionCheckResult } from '../services/permission.domain.service';

export interface PermissionServicePort {
  checkPermissions(context: PermissionCheckContext): Promise<PermissionCheckResult>;
  checkUserPermissions(userId: number, requiredPermissions: string[]): Promise<PermissionCheckResult>;
  checkUserRoles(userId: number, requiredRoles: number[]): Promise<boolean>;
  grantPermission(userId: number, permissionId: string, expiresAt?: Date): Promise<void>;
  revokePermission(userId: number, permissionId: string): Promise<void>;
  getUserPermissions(userId: number): Promise<{ direct: string[], roleBased: string[] }>;
}

