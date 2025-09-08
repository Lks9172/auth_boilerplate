import { IQuery } from '@nestjs/cqrs';

export class GetUserRolesQuery implements IQuery {
  constructor(public readonly userId: number) {}
}

export class GetUserRolesResult {
  constructor(public readonly roleIds: number[]) {}
}

