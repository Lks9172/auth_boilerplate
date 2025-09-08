import { ICommand } from '@nestjs/cqrs';

export class GrantPermissionCommand implements ICommand {
  constructor(
    public readonly userId: number,
    public readonly permissionId: string,
    public readonly expiresAt?: Date,
  ) {}
}

