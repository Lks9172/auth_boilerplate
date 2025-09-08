import { ICommand } from '@nestjs/cqrs';

export class RemoveRoleCommand implements ICommand {
  constructor(
    public readonly userId: number,
    public readonly roleId: number,
  ) {}
}

