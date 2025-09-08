import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { PermissionCheckService } from './services/permission-check.service';
import { UserPermission } from '../permissions/entities/user-permission.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { RolesModule } from '../roles/roles.module';

// Strategy Pattern
import { DirectPermissionStrategy } from './strategies/direct-permission.strategy';
import { RolePermissionStrategy } from './strategies/role-permission.strategy';

// Factory Pattern
import { PermissionStrategyFactory } from './factories/permission-strategy.factory';

// CQRS Commands
import { 
  CheckPermissionHandler,
  CheckRoleHandler,
  GrantPermissionHandler,
  RevokePermissionHandler,
} from './handlers/permission-command.handlers';

// CQRS Queries
import {
  GetUserPermissionsHandler,
  GetAllPermissionsHandler,
  GetPermissionCheckHistoryHandler,
} from './handlers/permission-query.handlers';

// CQRS Events
import {
  PermissionCheckRequestedHandler,
  PermissionCheckCompletedHandler,
  PermissionCheckFailedHandler,
  RoleCheckRequestedHandler,
  RoleCheckCompletedHandler,
} from './handlers/permission.handlers';

// CQRS 핸들러들을 배열로 정의
const CommandHandlers = [
  CheckPermissionHandler,
  CheckRoleHandler,
  GrantPermissionHandler,
  RevokePermissionHandler,
];

const QueryHandlers = [
  GetUserPermissionsHandler,
  GetAllPermissionsHandler,
  GetPermissionCheckHistoryHandler,
];

const EventHandlers = [
  PermissionCheckRequestedHandler,
  PermissionCheckCompletedHandler,
  PermissionCheckFailedHandler,
  RoleCheckRequestedHandler,
  RoleCheckCompletedHandler,
];

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([UserPermission, Permission]),
    CqrsModule,
    RolesModule,
  ],
  providers: [
    // Service
    PermissionCheckService,
    
    // Strategies
    DirectPermissionStrategy,
    RolePermissionStrategy,
    
    // Factory
    PermissionStrategyFactory,
    
    // CQRS Handlers
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
  exports: [
    PermissionCheckService,
    PermissionStrategyFactory,
    TypeOrmModule,
  ],
})
export class CommonModule {}
