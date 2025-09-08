import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';
import { UserEntity } from '../../infrastructure/entities/user.entity';
import { CreateUserCommand } from '../commands/create-user.command';
import { UpdateUserCommand } from '../commands/update-user.command';
import { DeleteUserCommand } from '../commands/delete-user.command';
import { AssignRoleCommand } from '../commands/assign-role.command';
import { RemoveRoleCommand } from '../commands/remove-role.command';
import { USER_REPOSITORY } from '../../domain/ports/user.repository.port';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(command: CreateUserCommand) {
    return this.userRepository.save(command.user);
  }
}

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(command: UpdateUserCommand) {
    return this.userRepository.save(command.user);
  }
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(command: DeleteUserCommand) {
    await this.userRepository.delete(command.userId);
  }
}

@CommandHandler(AssignRoleCommand)
export class AssignRoleHandler implements ICommandHandler<AssignRoleCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(command: AssignRoleCommand) {
    await this.userRepository.addUserRole(command.userId, command.roleId);
  }
}

@CommandHandler(RemoveRoleCommand)
export class RemoveRoleHandler implements ICommandHandler<RemoveRoleCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(command: RemoveRoleCommand) {
    await this.userRepository.removeUserRole(command.userId, command.roleId);
  }
}

export const UserCommandHandlers = [
  CreateUserHandler,
  UpdateUserHandler,
  DeleteUserHandler,
  AssignRoleHandler,
  RemoveRoleHandler,
];
