import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepositoryPort } from '../../domain/ports/user.repository.port';
import { UserEntity } from '../entities/user.entity';
import { UserRole } from '../entities/user-role.entity';
import { UserPermission } from '../../../permissions/entities/user-permission.entity';

@Injectable()
export class UserTypeOrmRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(UserPermission)
    private readonly userPermissionRepository: Repository<UserPermission>,
  ) {}

  async findById(id: number): Promise<UserEntity | null> {
    const userEntity = await this.userRepository.findOne({
      where: { id },
      relations: ['userRoles', 'userRoles.role', 'userPermissions', 'userPermissions.permission'],
    });

    return userEntity;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const userEntity = await this.userRepository.findOne({
      where: { email },
      relations: ['userRoles', 'userRoles.role', 'userPermissions', 'userPermissions.permission'],
    });

    return userEntity;
  }

  async findBySocialId(socialId: string): Promise<UserEntity | null> {
    const userEntity = await this.userRepository.findOne({
      where: { socialId },
      relations: ['userRoles', 'userRoles.role', 'userPermissions', 'userPermissions.permission'],
    });

    return userEntity;
  }

  async save(user: UserEntity): Promise<UserEntity> {
    return await this.userRepository.save(user);
  }

  async delete(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async findAll(): Promise<UserEntity[]> {
    const userEntities = await this.userRepository.find({
      relations: ['userRoles', 'userRoles.role', 'userPermissions', 'userPermissions.permission'],
    });

    return userEntities;
  }

  async findByIds(ids: number[]): Promise<UserEntity[]> {
    const userEntities = await this.userRepository.find({
      where: { id: { $in: ids } as any },
      relations: ['userRoles', 'userRoles.role', 'userPermissions', 'userPermissions.permission'],
    });

    return userEntities;
  }

  async findUserRoles(userId: number): Promise<number[]> {
    const userRoles = await this.userRoleRepository.find({
      where: { user: { id: userId }, isActive: true },
      relations: ['role'],
    });

    return userRoles.map(userRole => userRole.role.id);
  }

  async addUserRole(userId: number, roleId: number): Promise<void> {
    const existingUserRole = await this.userRoleRepository.findOne({
      where: { user: { id: userId }, role: { id: roleId } },
    });

    if (!existingUserRole) {
      const userRole = this.userRoleRepository.create({
        user: { id: userId },
        role: { id: roleId },
        isActive: true,
      });
      await this.userRoleRepository.save(userRole);
    }
  }

  async removeUserRole(userId: number, roleId: number): Promise<void> {
    await this.userRoleRepository.delete({
      user: { id: userId },
      role: { id: roleId },
    });
  }

  async findUserPermissions(userId: number): Promise<string[]> {
    const userPermissions = await this.userPermissionRepository.find({
      where: { user: { id: userId }, granted: true },
      relations: ['permission'],
    });

    return userPermissions
      .filter(up => !up.expiresAt || up.expiresAt > new Date())
      .map(up => up.permission.name);
  }

  async addUserPermission(userId: number, permissionId: string, expiresAt?: Date): Promise<void> {
    const existingPermission = await this.userPermissionRepository.findOne({
      where: { user: { id: userId }, permission: { name: permissionId } },
    });

    if (!existingPermission) {
      const userPermission = this.userPermissionRepository.create({
        user: { id: userId },
        permission: { name: permissionId },
        granted: true,
        expiresAt,
      });
      await this.userPermissionRepository.save(userPermission);
    }
  }

  async removeUserPermission(userId: number, permissionId: string): Promise<void> {
    await this.userPermissionRepository.delete({
      user: { id: userId },
      permission: { name: permissionId },
    });
  }

  // Mapping methods removed - using UserEntity directly
}
