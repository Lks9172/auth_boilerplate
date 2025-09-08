import { ICommand } from '@nestjs/cqrs';

export class AssignRoleCommand implements ICommand {
  constructor(
    public readonly userId: number,
    public readonly roleId: number,
  ) {}
}

