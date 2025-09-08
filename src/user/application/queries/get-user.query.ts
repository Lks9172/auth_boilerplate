import { IQuery } from '@nestjs/cqrs';
import { UserEntity } from '../../infrastructure/entities/user.entity';

export class GetUserQuery implements IQuery {
  constructor(public readonly userId: number) {}
}

export class GetUserResult {
  constructor(public readonly user: UserEntity | null) {}
}
