import { ICommand } from '@nestjs/cqrs';

export class CheckPermissionCommand implements ICommand {
  constructor(
    public readonly userId: number,
    public readonly requiredPermissions: string[],
  ) {}
}

