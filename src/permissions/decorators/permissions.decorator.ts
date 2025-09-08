import { SetMetadata } from '@nestjs/common';

export const Permissions = (...permissions: string[]) => SetMetadata('permissions', permissions);

// 편의를 위한 미리 정의된 권한들
export const PermissionsList = {
  // 사용자 관련
  USER_READ: 'users:read',
  USER_WRITE: 'users:write', 
  USER_DELETE: 'users:delete',
  USER_CREATE: 'users:create',
  
  // 파일 관련
  FILE_READ: 'files:read',
  FILE_WRITE: 'files:write',
  FILE_DELETE: 'files:delete',
  FILE_UPLOAD: 'files:upload',
  
  // 시스템 관련
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_LOGS: 'system:logs',
} as const;

// 복합 권한 데코레이터들
export const CanReadUsers = () => Permissions(PermissionsList.USER_READ);
export const CanWriteUsers = () => Permissions(PermissionsList.USER_WRITE);
export const CanDeleteUsers = () => Permissions(PermissionsList.USER_DELETE);
export const CanManageUsers = () => Permissions(
  PermissionsList.USER_READ, 
  PermissionsList.USER_WRITE, 
  PermissionsList.USER_DELETE,
  PermissionsList.USER_CREATE
);
