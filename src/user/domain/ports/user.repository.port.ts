import { UserEntity } from '../../infrastructure/entities/user.entity';

// Injection Token
export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface UserRepositoryPort {
  findById(id: number): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findBySocialId(socialId: string): Promise<UserEntity | null>;
  save(user: UserEntity): Promise<UserEntity>;
  delete(id: number): Promise<void>;
  findAll(): Promise<UserEntity[]>;
  findByIds(ids: number[]): Promise<UserEntity[]>;

  // Roles
  findUserRoles(userId: number): Promise<number[]>;
  addUserRole(userId: number, roleId: number): Promise<void>;
  removeUserRole(userId: number, roleId: number): Promise<void>;

  // Permissions
  findUserPermissions(userId: number): Promise<string[]>;
  addUserPermission(userId: number, permissionId: string, expiresAt?: Date): Promise<void>;
  removeUserPermission(userId: number, permissionId: string): Promise<void>;
}
