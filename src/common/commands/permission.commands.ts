import { ICommand } from '@nestjs/cqrs';

// 권한 체크 명령
export class CheckPermissionCommand implements ICommand {
  constructor(
    public readonly userId: number,
    public readonly requiredPermissions: string[],
    public readonly requestId: string,
    public readonly strategyType: string = 'hybrid',
  ) {}
}

// 역할 체크 명령
export class CheckRoleCommand implements ICommand {
  constructor(
    public readonly userId: number,
    public readonly requiredRoles: number[],
    public readonly requestId: string,
  ) {}
}

// 권한 부여 명령
export class GrantPermissionCommand implements ICommand {
  constructor(
    public readonly userId: number,
    public readonly permissionName: string,
    public readonly expiresAt?: Date,
  ) {}
}

// 권한 취소 명령
export class RevokePermissionCommand implements ICommand {
  constructor(
    public readonly userId: number,
    public readonly permissionName: string,
  ) {}
}
