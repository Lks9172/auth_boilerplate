import { IEvent } from '@nestjs/cqrs';
import { CreateUserDto } from '../../domain/ports/user.service.port';

export class UserCreatedEvent implements IEvent {
  constructor(
    public readonly userId: number,
    public readonly userData: CreateUserDto,
  ) {}
}

