import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { UserPermission } from '../entities/user-permission.entity';
import { UserEntity } from '../../user/infrastructure/entities/user.entity';
import { PermissionEventManager, PermissionEvent } from '../events/permission-events';

export interface GrantPermissionDto {
  userId: number;
  permissionName: string;
  expiresAt?: Date;
}

export interface RevokePermissionDto {
  userId: number;
  permissionName: string;
}

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(UserPermission)
    private userPermissionRepository: Repository<UserPermission>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private eventManager: PermissionEventManager,
  ) {}

  // 모든 권한 조회
  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.find();
  }

  // 권한 생성
  async createPermission(name: string, description?: string): Promise<Permission> {
    const [resource, action] = name.split(':');
    
    const permission = this.permissionRepository.create({
      name,
      description,
      resource: resource || 'unknown',
      action: action || 'unknown',
    });

    return this.permissionRepository.save(permission);
  }

  // 사용자에게 권한 부여
  async grantPermission(dto: GrantPermissionDto): Promise<UserPermission> {
    const user = await this.userRepository.findOne({ 
      where: { id: dto.userId } 
    });
    
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    const permission = await this.permissionRepository.findOne({
      where: { name: dto.permissionName }
    });

    if (!permission) {
      throw new NotFoundException('권한을 찾을 수 없습니다');
    }

    // 기존 권한이 있는지 확인
    const existingPermission = await this.userPermissionRepository.findOne({
      where: { 
        user: { id: dto.userId },
        permission: { id: permission.id }
      }
    });

    if (existingPermission) {
      // 기존 권한 업데이트
      existingPermission.granted = true;
      existingPermission.expiresAt = dto.expiresAt || undefined;
      const savedPermission = await this.userPermissionRepository.save(existingPermission);
      
      // 이벤트 발생
      this.eventManager.notifyObservers({
        userId: dto.userId,
        permissionName: dto.permissionName,
        action: 'granted',
        timestamp: new Date(),
      });
      
      return savedPermission;
    }

    // 새 권한 생성
    const userPermission = this.userPermissionRepository.create({
      user,
      permission,
      granted: true,
      expiresAt: dto.expiresAt,
    });

    const savedPermission = await this.userPermissionRepository.save(userPermission);
    
    // 이벤트 발생
    this.eventManager.notifyObservers({
      userId: dto.userId,
      permissionName: dto.permissionName,
      action: 'granted',
      timestamp: new Date(),
    });
    
    return savedPermission;
  }

  // 사용자 권한 취소
  async revokePermission(dto: RevokePermissionDto): Promise<void> {
    const permission = await this.permissionRepository.findOne({
      where: { name: dto.permissionName }
    });

    if (!permission) {
      throw new NotFoundException('권한을 찾을 수 없습니다');
    }

    await this.userPermissionRepository.delete({
      user: { id: dto.userId },
      permission: { id: permission.id }
    });

    // 이벤트 발생
    this.eventManager.notifyObservers({
      userId: dto.userId,
      permissionName: dto.permissionName,
      action: 'revoked',
      timestamp: new Date(),
    });
  }

  // 사용자의 모든 권한 조회
  async getUserPermissions(userId: number): Promise<UserPermission[]> {
    return this.userPermissionRepository.find({
      where: { 
        user: { id: userId },
        granted: true 
      },
      relations: ['permission'],
    });
  }

  // 사용자가 특정 권한을 가지고 있는지 확인
  async hasPermission(userId: number, permissionName: string): Promise<boolean> {
    const userPermission = await this.userPermissionRepository.findOne({
      where: {
        user: { id: userId },
        permission: { name: permissionName },
        granted: true,
      },
      relations: ['permission'],
    });

    if (!userPermission) {
      return false;
    }

    // 만료일 체크
    if (userPermission.expiresAt && userPermission.expiresAt < new Date()) {
      return false;
    }

    return true;
  }

  // 사용자의 유효한 권한 이름 목록 조회
  async getUserPermissionNames(userId: number): Promise<string[]> {
    const userPermissions = await this.getUserPermissions(userId);
    
    return userPermissions
      .filter(up => {
        // 만료일 체크
        if (up.expiresAt && up.expiresAt < new Date()) {
          return false;
        }
        return true;
      })
      .map(up => up.permission.name);
  }
}
