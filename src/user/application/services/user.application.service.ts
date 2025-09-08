import { Injectable, Inject } from '@nestjs/common';
import { CommandBus, QueryBus, EventBus } from '@nestjs/cqrs';
import { UserServicePort, CreateUserDto, UpdateUserDto } from '../../domain/ports/user.service.port';
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';
import { UserEntity } from '../../infrastructure/entities/user.entity';
import { UserDomainService } from '../../domain/services/user.domain.service';
import { USER_REPOSITORY } from '../../domain/ports/user.repository.port';

// Commands
import { CreateUserCommand } from '../commands/create-user.command';
import { UpdateUserCommand } from '../commands/update-user.command';
import { DeleteUserCommand } from '../commands/delete-user.command';
import { AssignRoleCommand } from '../commands/assign-role.command';
import { RemoveRoleCommand } from '../commands/remove-role.command';

// Queries
import { GetUserQuery } from '../queries/get-user.query';
import { GetAllUsersQuery } from '../queries/get-all-users.query';
import { GetUserRolesQuery } from '../queries/get-user-roles.query';

// Events
import { UserCreatedEvent } from '../events/user-created.event';
import { UserUpdatedEvent } from '../events/user-updated.event';
import { UserDeletedEvent } from '../events/user-deleted.event';
import { RoleAssignedEvent } from '../events/role-assigned.event';
import { RoleRemovedEvent } from '../events/role-removed.event';

@Injectable()
export class UserApplicationService implements UserServicePort {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly eventBus: EventBus,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    private readonly userDomainService: UserDomainService,
  ) {}

  async create(dto: CreateUserDto): Promise<UserEntity> {
    // Create user entity directly
    const userEntity = new UserEntity();
    userEntity.email = dto.email || null;
    userEntity.password = dto.password || '';
    userEntity.provider = dto.provider;
    userEntity.socialId = dto.socialId || null;
    userEntity.firstName = dto.firstName || null;
    userEntity.lastName = dto.lastName || null;
    userEntity.status = { id: dto.statusId } as any;
    userEntity.role = { id: dto.roleIds[0] } as any;

    const createdUser = await this.userRepository.save(userEntity);

    await this.eventBus.publish(
      new UserCreatedEvent(createdUser.id, dto)
    );

    return createdUser;
  }

  async findById(id: number): Promise<UserEntity | null> {
    return this.userRepository.findById(id);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findByEmail(email);
  }

  async findBySocialId(socialId: string): Promise<UserEntity | null> {
    return this.userRepository.findBySocialId(socialId);
  }

  async update(id: number, dto: UpdateUserDto): Promise<UserEntity> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    if (dto.email !== undefined) existingUser.email = dto.email;
    if (dto.firstName !== undefined) existingUser.firstName = dto.firstName;
    if (dto.lastName !== undefined) existingUser.lastName = dto.lastName;
    if (dto.password !== undefined) existingUser.password = dto.password;
    if (dto.statusId !== undefined) existingUser.status = { id: dto.statusId } as any;

    const result = await this.userRepository.save(existingUser);

    await this.eventBus.publish(
      new UserUpdatedEvent(id, dto)
    );

    return result;
  }

  async delete(id: number): Promise<void> {
    await this.userRepository.delete(id);
    await this.eventBus.publish(new UserDeletedEvent(id));
  }

  async findAll(): Promise<UserEntity[]> {
    return this.userRepository.findAll();
  }

  async assignRole(userId: number, roleId: number): Promise<void> {
    await this.userRepository.addUserRole(userId, roleId);

    await this.commandBus.execute(
      new AssignRoleCommand(userId, roleId)
    );

    await this.eventBus.publish(
      new RoleAssignedEvent(userId, roleId)
    );
  }

  async removeRole(userId: number, roleId: number): Promise<void> {
    await this.userRepository.removeUserRole(userId, roleId);

    await this.commandBus.execute(
      new RemoveRoleCommand(userId, roleId)
    );

    await this.eventBus.publish(
      new RoleRemovedEvent(userId, roleId)
    );
  }

  async getRoles(userId: number): Promise<number[]> {
    return this.queryBus.execute(new GetUserRolesQuery(userId));
  }

  async grantPermission(userId: number, permissionId: string, expiresAt?: Date): Promise<void> {
    await this.userRepository.addUserPermission(userId, permissionId, expiresAt);
  }

  async revokePermission(userId: number, permissionId: string): Promise<void> {
    await this.userRepository.removeUserPermission(userId, permissionId);
  }

  async getPermissions(userId: number): Promise<string[]> {
    return this.userRepository.findUserPermissions(userId);
  }
}
