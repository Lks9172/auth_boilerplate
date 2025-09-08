import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPermission } from '../../permissions/entities/user-permission.entity';
import { PermissionCheckStrategy, PermissionCheckResult } from './permission-check.strategy';

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
        if (up.expiresAt && up.expiresAt < new Date()) {
          return false;
        }
        return true;
      })
      .map(up => up.permission.name);

    const result = requiredPermissions.some(permission => 
      userPermissionNames.includes(permission)
    );

    console.log(`👤 Direct permission check for user ${userId}: ${result}`);
    return result;
  }

  getStrategyName(): string {
    return 'DirectPermission';
  }

  getPriority(): number {
    return 1; // 가장 높은 우선순위
  }
}
