import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { 
  CheckPermissionCommand,
  CheckRoleCommand,
  GrantPermissionCommand,
  RevokePermissionCommand,
} from '../commands/permission.commands';
import {
  GetUserPermissionsQuery,
  GetAllPermissionsQuery,
  GetPermissionCheckHistoryQuery,
} from '../queries/permission.queries';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PermissionCheckService {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  // 권한 체크 (명령 패턴 사용)
  async checkPermissions(
    userId: number, 
    requiredPermissions: string[],
    strategyType: string = 'hybrid'
  ): Promise<boolean> {
    const requestId = uuidv4();
    
    try {
      const result = await this.commandBus.execute(
        new CheckPermissionCommand(userId, requiredPermissions, requestId, strategyType)
      );
      
      console.log(`🔍 [CQRS] Permission check result for user ${userId}: ${result}`);
      return result;
    } catch (error) {
      console.error('❌ [CQRS] Permission check failed:', error);
      return false;
    }
  }

  // 역할 체크 (명령 패턴 사용)
  async checkRoles(userId: number, requiredRoles: number[]): Promise<boolean> {
    const requestId = uuidv4();
    
    try {
      const result = await this.commandBus.execute(
        new CheckRoleCommand(userId, requiredRoles, requestId)
      );
      
      console.log(`🔍 [CQRS] Role check result for user ${userId}: ${result}`);
      return result;
    } catch (error) {
      console.error('❌ [CQRS] Role check failed:', error);
      return false;
    }
  }

  // 권한 부여 (명령 패턴 사용)
  async grantPermission(
    userId: number,
    permissionName: string,
    expiresAt?: Date
  ): Promise<void> {
    try {
      await this.commandBus.execute(
        new GrantPermissionCommand(userId, permissionName, expiresAt)
      );
      
      console.log(`✅ [CQRS] Permission ${permissionName} granted to user ${userId}`);
    } catch (error) {
      console.error('❌ [CQRS] Grant permission failed:', error);
      throw error;
    }
  }

  // 권한 취소 (명령 패턴 사용)
  async revokePermission(userId: number, permissionName: string): Promise<void> {
    try {
      await this.commandBus.execute(
        new RevokePermissionCommand(userId, permissionName)
      );
      
      console.log(`✅ [CQRS] Permission ${permissionName} revoked from user ${userId}`);
    } catch (error) {
      console.error('❌ [CQRS] Revoke permission failed:', error);
      throw error;
    }
  }

  // 사용자 권한 조회 (쿼리 패턴 사용)
  async getUserPermissions(userId: number) {
    try {
      const result = await this.queryBus.execute(
        new GetUserPermissionsQuery(userId)
      );
      
      console.log(`📋 [CQRS] User permissions retrieved for user ${userId}`);
      return result;
    } catch (error) {
      console.error('❌ [CQRS] Get user permissions failed:', error);
      throw error;
    }
  }

  // 모든 권한 조회 (쿼리 패턴 사용)
  async getAllPermissions() {
    try {
      const result = await this.queryBus.execute(
        new GetAllPermissionsQuery()
      );
      
      console.log(`📋 [CQRS] All permissions retrieved`);
      return result;
    } catch (error) {
      console.error('❌ [CQRS] Get all permissions failed:', error);
      throw error;
    }
  }

  // 권한 체크 히스토리 조회 (쿼리 패턴 사용)
  async getPermissionCheckHistory(userId: number, limit: number = 10) {
    try {
      const result = await this.queryBus.execute(
        new GetPermissionCheckHistoryQuery(userId, limit)
      );
      
      console.log(`📋 [CQRS] Permission check history retrieved for user ${userId}`);
      return result;
    } catch (error) {
      console.error('❌ [CQRS] Get permission check history failed:', error);
      throw error;
    }
  }

  // 하이브리드 권한 체크 (역할 + 권한)
  async checkHybridAccess(
    userId: number,
    requiredPermissions: string[],
    requiredRoles: number[]
  ): Promise<boolean> {
    try {
      // 권한 체크와 역할 체크를 병렬로 실행
      const [permissionResult, roleResult] = await Promise.all([
        this.checkPermissions(userId, requiredPermissions, 'hybrid'),
        this.checkRoles(userId, requiredRoles),
      ]);

      // OR 조건으로 결과 반환
      const result = permissionResult || roleResult;
      
      console.log(`🔀 [CQRS] Hybrid access check for user ${userId}: ${result} (permission: ${permissionResult}, role: ${roleResult})`);
      return result;
    } catch (error) {
      console.error('❌ [CQRS] Hybrid access check failed:', error);
      return false;
    }
  }
}
