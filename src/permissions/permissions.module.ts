import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { UserPermission } from './entities/user-permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { PermissionService } from './application/permission.service';
import { HybridAccessGuard } from './guards/hybrid-access.guard';
import { PermissionController } from './presentation/permission.controller';
import { UserEntity } from '../user/infrastructure/entities/user.entity';
import { RolesModule } from '../roles/roles.module';
import { PermissionEventManager } from './events/permission-events';
import { PermissionLogObserver } from './observers/permission-log.observer';
import { PermissionCacheObserver } from './observers/permission-cache.observer';
import { PermissionInitService } from './services/permission-init.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission, UserPermission, RolePermission, UserEntity]),
    RolesModule,
  ],
  controllers: [PermissionController],
  providers: [
    PermissionService, 
    HybridAccessGuard,
    PermissionEventManager,
    PermissionLogObserver,
    PermissionCacheObserver,
    PermissionInitService,
  ],
  exports: [PermissionService, HybridAccessGuard, TypeOrmModule],
})
export class PermissionsModule {}
