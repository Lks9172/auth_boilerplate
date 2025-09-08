import { User } from '../entities/user.entity';

export interface UserRepositoryPort {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findBySocialId(socialId: string): Promise<User | null>;
  save(user: User): Promise<User>;
  delete(id: number): Promise<void>;
  findAll(): Promise<User[]>;
  findByIds(ids: number[]): Promise<User[]>;
  
  // 역할 관련
  findUserRoles(userId: number): Promise<number[]>;
  addUserRole(userId: number, roleId: number): Promise<void>;
  removeUserRole(userId: number, roleId: number): Promise<void>;
  
  // 권한 관련
  findUserDirectPermissions(userId: number): Promise<string[]>;
  addUserPermission(userId: number, permissionId: string, expiresAt?: Date): Promise<void>;
  removeUserPermission(userId: number, permissionId: string): Promise<void>;
}

