import { Role } from '../entities/role.entity';

export interface RoleRepositoryPort {
  findById(id: number): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  save(role: Role): Promise<Role>;
  delete(id: number): Promise<void>;
  findAll(): Promise<Role[]>;
  findByIds(ids: number[]): Promise<Role[]>;
  findActiveRoles(): Promise<Role[]>;
  
  // 계층 구조 관련
  findChildren(parentId: number): Promise<Role[]>;
  findParents(childId: number): Promise<Role[]>;
  findHierarchy(roleId: number): Promise<Role[]>;
  
  // 권한 관련
  findRolePermissions(roleId: number): Promise<string[]>;
  addRolePermission(roleId: number, permissionId: string): Promise<void>;
  removeRolePermission(roleId: number, permissionId: string): Promise<void>;
}

