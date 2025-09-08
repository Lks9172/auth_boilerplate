import { IEvent } from '@nestjs/cqrs';

export class RoleRemovedEvent implements IEvent {
  constructor(
    public readonly userId: number,
    public readonly roleId: number,
  ) {}
}

