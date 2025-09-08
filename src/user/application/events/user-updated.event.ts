import { IEvent } from '@nestjs/cqrs';
import { UpdateUserDto } from '../../domain/ports/user.service.port';

export class UserUpdatedEvent implements IEvent {
  constructor(
    public readonly userId: number,
    public readonly userData: UpdateUserDto,
  ) {}
}

