import { IQuery } from '@nestjs/cqrs';
import { UserEntity } from '../../infrastructure/entities/user.entity';

export class GetAllUsersQuery implements IQuery {}

export class GetAllUsersResult {
  constructor(public readonly users: UserEntity[]) {}
}
