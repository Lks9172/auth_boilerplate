import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RoleService } from '../application/role.service';
import { Role } from '../entities/role.entity';
import { RolePermission } from '../../permissions/entities/role-permission.entity';
import { Roles } from '../roles.decorator';
import { RoleEnum } from '../roles.enum';
import { RolesGuard } from '../roles.guard';

@ApiBearerAuth()
@ApiTags('Roles')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({
  path: 'roles',
  version: '1',
})
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '모든 역할 조회 (계층구조 포함)' })
  @Roles(RoleEnum.admin)
  async getAllRoles(): Promise<Role[]> {
    return this.roleService.getAllRoles();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '특정 역할 조회' })
  @Roles(RoleEnum.admin)
  async getRole(@Param('id', ParseIntPipe) id: number): Promise<Role | null> {
    return this.roleService.findRole(id);
  }

  @Get(':id/permissions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '역할의 모든 권한 조회 (계층구조 포함)' })
  @Roles(RoleEnum.admin)
  async getRolePermissions(@Param('id', ParseIntPipe) id: number): Promise<string[]> {
    return this.roleService.getRolePermissions(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '새 역할 생성' })
  @Roles(RoleEnum.admin)
  async createRole(
    @Body() createRoleDto: {
      id: number;
      name: string;
      description?: string;
      level: number;
      parentId?: number;
    },
  ): Promise<Role> {
    return this.roleService.createRole(createRoleDto);
  }

  @Post(':id/permissions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '역할에 권한 부여' })
  @Roles(RoleEnum.admin)
  async grantPermissionToRole(
    @Param('id', ParseIntPipe) roleId: number,
    @Body() grantDto: { permissionName: string },
  ): Promise<RolePermission> {
    return this.roleService.grantPermissionToRole(roleId, grantDto.permissionName);
  }

  @Delete(':id/permissions')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '역할에서 권한 제거' })
  @Roles(RoleEnum.admin)
  async revokePermissionFromRole(
    @Param('id', ParseIntPipe) roleId: number,
    @Body() revokeDto: { permissionName: string },
  ): Promise<void> {
    return this.roleService.revokePermissionFromRole(roleId, revokeDto.permissionName);
  }
}
