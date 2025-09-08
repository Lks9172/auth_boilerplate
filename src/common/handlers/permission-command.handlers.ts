import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { 
  CheckPermissionCommand,
  CheckRoleCommand,
  GrantPermissionCommand,
  RevokePermissionCommand,
} from '../commands/permission.commands';
import {
  PermissionCheckRequestedEvent,
  PermissionCheckCompletedEvent,
  PermissionCheckFailedEvent,
  RoleCheckRequestedEvent,
  RoleCheckCompletedEvent,
} from '../events/permission.events';
import { PermissionStrategyFactory, PermissionStrategyType } from '../factories/permission-strategy.factory';
import { RoleService } from '../../roles/application/role.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPermission } from '../../permissions/entities/user-permission.entity';
import { Permission } from '../../permissions/entities/permission.entity';

// 권한 체크 명령 핸들러
@CommandHandler(CheckPermissionCommand)
export class CheckPermissionHandler implements ICommandHandler<CheckPermissionCommand> {
  constructor(
    private eventBus: EventBus,
    private strategyFactory: PermissionStrategyFactory,
  ) {}

  async execute(command: CheckPermissionCommand): Promise<boolean> {
    const { userId, requiredPermissions, requestId, strategyType } = command;

    // 이벤트 발행: 권한 체크 요청
    this.eventBus.publish(
      new PermissionCheckRequestedEvent(userId, requiredPermissions, requestId, new Date())
    );

    try {
      // 전략 팩토리를 사용하여 권한 체크 수행
      const strategy = this.strategyFactory.createStrategy(
        strategyType as PermissionStrategyType
      );
      
      const result = await strategy.canAccess(userId, requiredPermissions);

      // 이벤트 발행: 권한 체크 완료
      this.eventBus.publish(
        new PermissionCheckCompletedEvent(
          requestId,
          userId,
          result,
          strategy.getStrategyName(),
          requiredPermissions,
          new Date(),
          { strategyType }
        )
      );

      return result;
    } catch (error) {
      // 이벤트 발행: 권한 체크 실패
      this.eventBus.publish(
        new PermissionCheckFailedEvent(
          requestId,
          userId,
          requiredPermissions,
          error.message,
          new Date()
        )
      );

      console.error('❌ Permission check failed:', error);
      return false;
    }
  }
}

// 역할 체크 명령 핸들러
@CommandHandler(CheckRoleCommand)
export class CheckRoleHandler implements ICommandHandler<CheckRoleCommand> {
  constructor(
    private eventBus: EventBus,
    private roleService: RoleService,
  ) {}

  async execute(command: CheckRoleCommand): Promise<boolean> {
    const { userId, requiredRoles, requestId } = command;

    // 이벤트 발행: 역할 체크 요청
    this.eventBus.publish(
      new RoleCheckRequestedEvent(userId, requiredRoles, requestId, new Date())
    );

    try {
      // 사용자 정보 조회 (실제로는 UserService를 통해 조회해야 함)
      const user = await this.getUserWithRole(userId);
      const result = user?.role?.id ? requiredRoles.includes(user.role.id) : false;

      // 이벤트 발행: 역할 체크 완료
      this.eventBus.publish(
        new RoleCheckCompletedEvent(requestId, userId, result, new Date())
      );

      return result;
    } catch (error) {
      console.error('❌ Role check failed:', error);
      return false;
    }
  }

  private async getUserWithRole(userId: number): Promise<any> {
    // 실제로는 UserService를 통해 조회해야 함
    return { id: userId, role: { id: 1 } }; // Admin 역할 가정
  }
}

// 권한 부여 명령 핸들러
@CommandHandler(GrantPermissionCommand)
export class GrantPermissionHandler implements ICommandHandler<GrantPermissionCommand> {
  constructor(
    @InjectRepository(UserPermission)
    private userPermissionRepository: Repository<UserPermission>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async execute(command: GrantPermissionCommand): Promise<void> {
    const { userId, permissionName, expiresAt } = command;

    try {
      // 권한이 존재하는지 확인
      let permission = await this.permissionRepository.findOne({
        where: { name: permissionName }
      });

      if (!permission) {
        // 권한이 없으면 생성
        permission = this.permissionRepository.create({
          name: permissionName,
          description: `Auto-generated permission: ${permissionName}`,
          resource: permissionName.split(':')[0] || 'general',
          action: permissionName.split(':')[1] || 'access',
        });
        await this.permissionRepository.save(permission);
      }

      // 사용자 권한 부여
      const userPermission = this.userPermissionRepository.create({
        user: { id: userId },
        permission,
        granted: true,
        expiresAt,
      });

      await this.userPermissionRepository.save(userPermission);

      console.log(`✅ Permission ${permissionName} granted to user ${userId}`);
    } catch (error) {
      console.error('❌ Grant permission failed:', error);
      throw error;
    }
  }
}

// 권한 취소 명령 핸들러
@CommandHandler(RevokePermissionCommand)
export class RevokePermissionHandler implements ICommandHandler<RevokePermissionCommand> {
  constructor(
    @InjectRepository(UserPermission)
    private userPermissionRepository: Repository<UserPermission>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async execute(command: RevokePermissionCommand): Promise<void> {
    const { userId, permissionName } = command;

    try {
      const permission = await this.permissionRepository.findOne({
        where: { name: permissionName }
      });

      if (permission) {
        await this.userPermissionRepository.delete({
          user: { id: userId },
          permission: { id: permission.id },
        });

        console.log(`✅ Permission ${permissionName} revoked from user ${userId}`);
      }
    } catch (error) {
      console.error('❌ Revoke permission failed:', error);
      throw error;
    }
  }
}
