import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { 
  GetUserPermissionsQuery,
  GetUserPermissionsResult,
  GetAllPermissionsQuery,
  GetAllPermissionsResult,
  GetPermissionCheckHistoryQuery,
  GetPermissionCheckHistoryResult,
} from '../queries/permission.queries';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPermission } from '../../permissions/entities/user-permission.entity';
import { Permission } from '../../permissions/entities/permission.entity';
import { RoleService } from '../../roles/application/role.service';

// 사용자 권한 조회 쿼리 핸들러
@QueryHandler(GetUserPermissionsQuery)
export class GetUserPermissionsHandler implements IQueryHandler<GetUserPermissionsQuery> {
  constructor(
    @InjectRepository(UserPermission)
    private userPermissionRepository: Repository<UserPermission>,
    private roleService: RoleService,
  ) {}

  async execute(query: GetUserPermissionsQuery): Promise<GetUserPermissionsResult> {
    const { userId } = query;

    try {
      // 사용자 직접 권한 조회
      const userPermissions = await this.userPermissionRepository.find({
        where: { 
          user: { id: userId },
          granted: true,
        },
        relations: ['permission'],
      });

      const permissions = userPermissions
        .filter(up => {
          if (up.expiresAt && up.expiresAt < new Date()) {
            return false;
          }
          return true;
        })
        .map(up => up.permission.name);

      // 사용자 역할 권한 조회
      const user = await this.getUserWithRole(userId);
      const roles = user?.role?.id ? await this.roleService.getRolePermissions(user.role.id) : [];

      return new GetUserPermissionsResult(userId, permissions, roles);
    } catch (error) {
      console.error('❌ Get user permissions failed:', error);
      return new GetUserPermissionsResult(userId, [], []);
    }
  }

  private async getUserWithRole(userId: number): Promise<any> {
    // 실제로는 UserService를 통해 조회해야 함
    return { id: userId, role: { id: 1 } }; // Admin 역할 가정
  }
}

// 모든 권한 조회 쿼리 핸들러
@QueryHandler(GetAllPermissionsQuery)
export class GetAllPermissionsHandler implements IQueryHandler<GetAllPermissionsQuery> {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async execute(query: GetAllPermissionsQuery): Promise<GetAllPermissionsResult> {
    try {
      const permissions = await this.permissionRepository.find({
        select: ['id', 'name', 'description'],
        order: { name: 'ASC' },
      });

      // 타입 안전성을 위해 description이 undefined인 경우 빈 문자열로 처리
      const mappedPermissions = permissions.map(permission => ({
        id: permission.id,
        name: permission.name,
        description: permission.description || '',
      }));

      return new GetAllPermissionsResult(mappedPermissions);
    } catch (error) {
      console.error('❌ Get all permissions failed:', error);
      return new GetAllPermissionsResult([]);
    }
  }
}

// 권한 체크 히스토리 조회 쿼리 핸들러
@QueryHandler(GetPermissionCheckHistoryQuery)
export class GetPermissionCheckHistoryHandler implements IQueryHandler<GetPermissionCheckHistoryQuery> {
  async execute(query: GetPermissionCheckHistoryQuery): Promise<GetPermissionCheckHistoryResult> {
    const { userId, limit } = query;

    try {
      // 실제로는 권한 체크 히스토리를 저장하는 테이블에서 조회해야 함
      // 현재는 임시 데이터 반환
      const history = [
        {
          timestamp: new Date(),
          permissions: ['users:read'],
          result: true,
          strategy: 'DirectPermission',
        },
        {
          timestamp: new Date(Date.now() - 60000), // 1분 전
          permissions: ['users:write'],
          result: false,
          strategy: 'RolePermission',
        },
      ].slice(0, limit);

      return new GetPermissionCheckHistoryResult(userId, history);
    } catch (error) {
      console.error('❌ Get permission check history failed:', error);
      return new GetPermissionCheckHistoryResult(userId, []);
    }
  }
}
