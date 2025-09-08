import { ICommand } from '@nestjs/cqrs';
import { UserEntity } from '../../infrastructure/entities/user.entity';

export class UpdateUserCommand implements ICommand {
  constructor(
    public readonly userId: number,
    public readonly user: UserEntity,
  ) {}
}
