import { IEvent } from '@nestjs/cqrs';

// 권한 체크 요청 이벤트
export class PermissionCheckRequestedEvent implements IEvent {
  constructor(
    public readonly userId: number,
    public readonly requiredPermissions: string[],
    public readonly requestId: string,
    public readonly timestamp: Date,
  ) {}
}

// 권한 체크 완료 이벤트
export class PermissionCheckCompletedEvent implements IEvent {
  constructor(
    public readonly requestId: string,
    public readonly userId: number,
    public readonly result: boolean,
    public readonly strategy: string,
    public readonly permissions: string[],
    public readonly timestamp: Date,
    public readonly metadata?: Record<string, any>,
  ) {}
}

// 권한 체크 실패 이벤트
export class PermissionCheckFailedEvent implements IEvent {
  constructor(
    public readonly requestId: string,
    public readonly userId: number,
    public readonly permissions: string[],
    public readonly error: string,
    public readonly timestamp: Date,
  ) {}
}

// 역할 체크 요청 이벤트
export class RoleCheckRequestedEvent implements IEvent {
  constructor(
    public readonly userId: number,
    public readonly requiredRoles: number[],
    public readonly requestId: string,
    public readonly timestamp: Date,
  ) {}
}

// 역할 체크 완료 이벤트
export class RoleCheckCompletedEvent implements IEvent {
  constructor(
    public readonly requestId: string,
    public readonly userId: number,
    public readonly result: boolean,
    public readonly timestamp: Date,
  ) {}
}
