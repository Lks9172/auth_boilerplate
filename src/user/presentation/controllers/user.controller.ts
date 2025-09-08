import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserServicePort } from '../../domain/ports/user.service.port';
import { CreateUserDto, UpdateUserDto } from '../../domain/ports/user.service.port';
import { RolesGuard } from '../../../roles/roles.guard';
import { Roles } from '../../../roles/roles.decorator';
import { RoleEnum } from '../../../roles/roles.enum';
import { HybridAccessGuard } from '../../../permissions/guards/hybrid-access.guard';
import { Permissions } from '../../../permissions/decorators/permissions.decorator';
import { USER_SERVICE } from '../../domain/ports/user.service.port';

@ApiTags('Users')
@Controller('user')
@UseGuards(RolesGuard, HybridAccessGuard)
@ApiBearerAuth()
export class UserController {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: UserServicePort
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Roles(RoleEnum.admin)
  @Permissions('user:create')
  async create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return user list' })
  @Roles(RoleEnum.admin)
  @Permissions('user:read')
  async findAll() {
    return this.userService.findAll();
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'Return current user info' })
  async findMe(@Request() req) {
    return this.userService.findById(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200, description: 'Return user info' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Roles(RoleEnum.admin)
  @Permissions('user:read')
  async findOne(@Param('id') id: string) {
    return this.userService.findById(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Roles(RoleEnum.admin)
  @Permissions('user:update')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(+id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Roles(RoleEnum.admin)
  @Permissions('user:delete')
  async remove(@Param('id') id: string) {
    await this.userService.delete(+id);
  }

  @Post(':id/roles/:roleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiResponse({ status: 200, description: 'Role assigned successfully' })
  @Roles(RoleEnum.admin)
  @Permissions('user:assign-role')
  async assignRole(
    @Param('id') userId: string,
    @Param('roleId') roleId: string,
  ) {
    await this.userService.assignRole(+userId, +roleId);
  }

  @Delete(':id/roles/:roleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove role from user' })
  @ApiResponse({ status: 204, description: 'Role removed successfully' })
  @Roles(RoleEnum.admin)
  @Permissions('user:remove-role')
  async removeRole(
    @Param('id') userId: string,
    @Param('roleId') roleId: string,
  ) {
    await this.userService.removeRole(+userId, +roleId);
  }

  @Get(':id/roles')
  @ApiOperation({ summary: 'Get user roles' })
  @ApiResponse({ status: 200, description: 'Return user roles' })
  @Roles(RoleEnum.admin)
  @Permissions('user:read-roles')
  async getRoles(@Param('id') userId: string) {
    return this.userService.getRoles(+userId);
  }

  @Post(':id/permissions/:permissionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Grant permission to user' })
  @ApiResponse({ status: 200, description: 'Permission granted successfully' })
  @Roles(RoleEnum.admin)
  @Permissions('user:grant-permission')
  async grantPermission(
    @Param('id') userId: string,
    @Param('permissionId') permissionId: string,
    @Body() body: { expiresAt?: string },
  ) {
    const expiresAt = body.expiresAt ? new Date(body.expiresAt) : undefined;
    await this.userService.grantPermission(+userId, permissionId, expiresAt);
  }

  @Delete(':id/permissions/:permissionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke permission from user' })
  @ApiResponse({ status: 204, description: 'Permission revoked successfully' })
  @Roles(RoleEnum.admin)
  @Permissions('user:revoke-permission')
  async revokePermission(
    @Param('id') userId: string,
    @Param('permissionId') permissionId: string,
  ) {
    await this.userService.revokePermission(+userId, permissionId);
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: 'Get user permissions' })
  @ApiResponse({ status: 200, description: 'Return user permissions' })
  @Roles(RoleEnum.admin)
  @Permissions('user:read-permissions')
  async getPermissions(@Param('id') userId: string) {
    return this.userService.getPermissions(+userId);
  }
}
