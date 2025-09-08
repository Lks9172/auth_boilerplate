import { IEvent } from '@nestjs/cqrs';

export class RoleAssignedEvent implements IEvent {
  constructor(
    public readonly userId: number,
    public readonly roleId: number,
  ) {}
}

