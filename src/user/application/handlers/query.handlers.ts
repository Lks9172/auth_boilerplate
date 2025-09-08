import { Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';
import { GetUserQuery, GetUserResult } from '../queries/get-user.query';
import { GetAllUsersQuery, GetAllUsersResult } from '../queries/get-all-users.query';
import { GetUserRolesQuery, GetUserRolesResult } from '../queries/get-user-roles.query';
import { USER_REPOSITORY } from '../../domain/ports/user.repository.port';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(query: GetUserQuery): Promise<GetUserResult> {
    const user = await this.userRepository.findById(query.userId);
    return new GetUserResult(user);
  }
}

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersHandler implements IQueryHandler<GetAllUsersQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(query: GetAllUsersQuery): Promise<GetAllUsersResult> {
    const users = await this.userRepository.findAll();
    return new GetAllUsersResult(users);
  }
}

@QueryHandler(GetUserRolesQuery)
export class GetUserRolesHandler implements IQueryHandler<GetUserRolesQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(query: GetUserRolesQuery): Promise<GetUserRolesResult> {
    const roleIds = await this.userRepository.findUserRoles(query.userId);
    return new GetUserRolesResult(roleIds);
  }
}

export const UserQueryHandlers = [
  GetUserHandler,
  GetAllUsersHandler,
  GetUserRolesHandler,
];
