import { UserEntity } from '../../infrastructure/entities/user.entity';

// Injection Token
export const USER_SERVICE = 'USER_SERVICE';

export interface CreateUserDto {
  email?: string;
  password?: string;
  provider: string;
  socialId?: string;
  firstName?: string;
  lastName?: string;
  photoId?: number;
  statusId: number;
  roleIds: number[];
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  photoId?: number;
  statusId?: number;
  password?: string;
}

export interface UserServicePort {
  create(dto: CreateUserDto): Promise<UserEntity>;
  findById(id: number): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findBySocialId(socialId: string): Promise<UserEntity | null>;
  update(id: number, dto: UpdateUserDto): Promise<UserEntity>;
  delete(id: number): Promise<void>;
  findAll(): Promise<UserEntity[]>;

  // Roles
  assignRole(userId: number, roleId: number): Promise<void>;
  removeRole(userId: number, roleId: number): Promise<void>;
  getRoles(userId: number): Promise<number[]>;

  // Permissions
  grantPermission(userId: number, permissionId: string, expiresAt?: Date): Promise<void>;
  revokePermission(userId: number, permissionId: string): Promise<void>;
  getPermissions(userId: number): Promise<string[]>;
}
