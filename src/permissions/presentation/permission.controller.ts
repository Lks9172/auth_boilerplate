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
import { PermissionService, GrantPermissionDto } from '../application/permission.service';
import { Permission } from '../entities/permission.entity';
import { UserPermission } from '../entities/user-permission.entity';
import { Roles } from '../../roles/roles.decorator';
import { RoleEnum } from '../../roles/roles.enum';
import { HybridAccessGuard } from '../guards/hybrid-access.guard';
import { Permissions } from '../decorators/permissions.decorator';

@ApiBearerAuth()
@ApiTags('Permissions')
@UseGuards(AuthGuard('jwt'), HybridAccessGuard)
@Controller({
  path: 'permissions',
  version: '1',
})
export class PermissionController {
  constructor(private permissionService: PermissionService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '모든 권한 조회' })
  @Roles(RoleEnum.admin) // 관리자만 모든 권한 조회 가능
  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionService.getAllPermissions();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '새 권한 생성' })
  @Roles(RoleEnum.admin) // 관리자만 권한 생성 가능
  async createPermission(
    @Body() createPermissionDto: { name: string; description?: string },
  ): Promise<Permission> {
    return this.permissionService.createPermission(
      createPermissionDto.name,
      createPermissionDto.description,
    );
  }

  @Post('grant')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '사용자에게 권한 부여' })
  @Roles(RoleEnum.admin) // 관리자만 권한 부여 가능
  async grantPermission(@Body() grantDto: GrantPermissionDto): Promise<UserPermission> {
    return this.permissionService.grantPermission(grantDto);
  }

  @Delete('revoke')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '사용자 권한 취소' })
  @Roles(RoleEnum.admin) // 관리자만 권한 취소 가능
  async revokePermission(
    @Body() revokeDto: { userId: number; permissionName: string },
  ): Promise<void> {
    return this.permissionService.revokePermission(revokeDto);
  }

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '사용자의 모든 권한 조회' })
  @Roles(RoleEnum.admin) // 관리자만 다른 사용자 권한 조회 가능
  @Permissions('users:read') // 또는 사용자 읽기 권한
  async getUserPermissions(@Param('userId', ParseIntPipe) userId: number): Promise<UserPermission[]> {
    return this.permissionService.getUserPermissions(userId);
  }

  @Get('user/:userId/check/:permissionName')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '사용자의 특정 권한 보유 여부 확인' })
  @Roles(RoleEnum.admin) // 관리자만 권한 확인 가능
  async checkUserPermission(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('permissionName') permissionName: string,
  ): Promise<{ hasPermission: boolean }> {
    const hasPermission = await this.permissionService.hasPermission(userId, permissionName);
    return { hasPermission };
  }
}
