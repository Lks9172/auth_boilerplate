import { IQuery } from '@nestjs/cqrs';

// 사용자 권한 조회 쿼리
export class GetUserPermissionsQuery implements IQuery {
  constructor(public readonly userId: number) {}
}

// 사용자 권한 조회 결과
export class GetUserPermissionsResult {
  constructor(
    public readonly userId: number,
    public readonly permissions: string[],
    public readonly roles: string[],
  ) {}
}

// 권한 목록 조회 쿼리
export class GetAllPermissionsQuery implements IQuery {
  constructor() {}
}

// 권한 목록 조회 결과
export class GetAllPermissionsResult {
  constructor(public readonly permissions: Array<{ id: number; name: string; description: string }>) {}
}

// 권한 체크 히스토리 조회 쿼리
export class GetPermissionCheckHistoryQuery implements IQuery {
  constructor(
    public readonly userId: number,
    public readonly limit: number = 10,
  ) {}
}

// 권한 체크 히스토리 결과
export class GetPermissionCheckHistoryResult {
  constructor(
    public readonly userId: number,
    public readonly history: Array<{
      timestamp: Date;
      permissions: string[];
      result: boolean;
      strategy: string;
    }>,
  ) {}
}
