import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { RolePermission } from '../../permissions/entities/role-permission.entity';
import { Permission } from '../../permissions/entities/permission.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  // 역할의 모든 권한 조회 (계층구조 포함)
  async getRolePermissions(roleId: number): Promise<string[]> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['parent', 'children'],
    });

    if (!role) {
      return [];
    }

    // 현재 역할의 직접 권한
    const directPermissions = await this.rolePermissionRepository.find({
      where: { role: { id: roleId } },
      relations: ['permission'],
    });

    const permissions = new Set<string>();
    
    // 직접 권한 추가
    directPermissions.forEach(rp => {
      permissions.add(rp.permission.name);
    });

    // 자식 역할들의 권한도 포함 (재귀적으로)
    await this.addChildRolePermissions(roleId, permissions);

    return Array.from(permissions);
  }

  // 재귀적으로 자식 역할들의 권한을 추가
  private async addChildRolePermissions(roleId: number, permissions: Set<string>): Promise<void> {
    const childRoles = await this.roleRepository.find({
      where: { parent: { id: roleId } },
    });

    for (const childRole of childRoles) {
      // 자식 역할의 직접 권한 추가
      const childPermissions = await this.rolePermissionRepository.find({
        where: { role: { id: childRole.id } },
        relations: ['permission'],
      });

      childPermissions.forEach(rp => {
        permissions.add(rp.permission.name);
      });

      // 재귀적으로 손자 역할들의 권한도 추가
      await this.addChildRolePermissions(childRole.id, permissions);
    }
  }

  // 역할에 권한 부여
  async grantPermissionToRole(roleId: number, permissionName: string): Promise<RolePermission> {
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('역할을 찾을 수 없습니다');
    }

    const permission = await this.permissionRepository.findOne({
      where: { name: permissionName }
    });
    if (!permission) {
      throw new NotFoundException('권한을 찾을 수 없습니다');
    }

    // 이미 존재하는 권한인지 확인
    const existing = await this.rolePermissionRepository.findOne({
      where: { 
        role: { id: roleId },
        permission: { id: permission.id }
      }
    });

    if (existing) {
      return existing;
    }

    const rolePermission = this.rolePermissionRepository.create({
      role,
      permission,
    });

    return this.rolePermissionRepository.save(rolePermission);
  }

  // 역할에서 권한 제거
  async revokePermissionFromRole(roleId: number, permissionName: string): Promise<void> {
    const permission = await this.permissionRepository.findOne({
      where: { name: permissionName }
    });
    if (!permission) {
      throw new NotFoundException('권한을 찾을 수 없습니다');
    }

    await this.rolePermissionRepository.delete({
      role: { id: roleId },
      permission: { id: permission.id }
    });
  }

  // 역할 생성
  async createRole(data: {
    id: number;
    name: string;
    description?: string;
    level: number;
    parentId?: number;
  }): Promise<Role> {
    const role = this.roleRepository.create({
      id: data.id,
      name: data.name,
      description: data.description,
      level: data.level,
    });

    if (data.parentId) {
      const parent = await this.roleRepository.findOne({ 
        where: { id: data.parentId } 
      });
      if (parent) {
        role.parent = parent;
      }
    }

    return this.roleRepository.save(role);
  }

  // 모든 역할 조회 (계층구조 포함)
  async getAllRoles(): Promise<Role[]> {
    return this.roleRepository.find({
      relations: ['parent', 'children'],
      order: { level: 'ASC', id: 'ASC' }
    });
  }

  // 특정 역할 조회
  async findRole(id: number): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { id },
      relations: ['parent', 'children']
    });
  }
}
