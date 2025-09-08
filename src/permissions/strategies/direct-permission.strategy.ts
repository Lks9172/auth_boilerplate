import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPermission } from '../entities/user-permission.entity';
import { PermissionCheckStrategy } from './permission-check.strategy';

@Injectable()
export class DirectPermissionStrategy implements PermissionCheckStrategy {
  constructor(
    @InjectRepository(UserPermission)
    private userPermissionRepository: Repository<UserPermission>,
  ) {}

  async canAccess(userId: number, requiredPermissions: string[]): Promise<boolean> {
    const userPermissions = await this.userPermissionRepository.find({
      where: { 
        user: { id: userId },
        granted: true,
      },
      relations: ['permission'],
    });

    const userPermissionNames = userPermissions
      .filter(up => {
        // 만료일 체크
        if (up.expiresAt && up.expiresAt < new Date()) {
          return false;
        }
        return true;
      })
      .map(up => up.permission.name);

    // 필요한 권한 중 하나라도 있으면 허용
    return requiredPermissions.some(permission => 
      userPermissionNames.includes(permission)
    );
  }

  getStrategyName(): string {
    return 'DirectPermission';
  }
}

