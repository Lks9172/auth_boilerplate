import { ICommand } from '@nestjs/cqrs';

export class RevokePermissionCommand implements ICommand {
  constructor(
    public readonly userId: number,
    public readonly permissionId: string,
  ) {}
}

