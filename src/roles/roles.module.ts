import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { RoleService } from './application/role.service';
import { RoleController } from './presentation/role.controller';
import { RolesGuard } from './roles.guard';
import { RolePermission } from '../permissions/entities/role-permission.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { UserPermission } from '../permissions/entities/user-permission.entity';
import { UserEntity } from '../user/infrastructure/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, RolePermission, Permission, UserPermission, UserEntity]),
  ],
  controllers: [RoleController],
  providers: [RoleService, RolesGuard],
  exports: [RoleService, RolesGuard, TypeOrmModule],
})
export class RolesModule {}
