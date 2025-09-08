import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  Delete,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import { UserEntity } from '../infrastructure/entities/user.entity';
import { CreateUserDto } from '../application/dto/create-user.dto';
import { UserService } from '../application/user.service';
import { RolesGuard } from '../../roles/roles.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NullableType } from '../../utils/types/nullable.type';
import { UpdateUserDto } from '../application/dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../roles/roles.decorator';
import { RoleEnum } from '../../roles/roles.enum';
import { HybridAccessGuard } from '../../permissions/guards/hybrid-access.guard';
import { Permissions, CanReadUsers, CanWriteUsers, CanDeleteUsers } from '../../permissions/decorators/permissions.decorator';

@ApiBearerAuth()
@ApiTags('User')
@UseGuards(AuthGuard('jwt'), HybridAccessGuard)
@Controller({
  path: 'user',
  version: '1',
})
export class UserController {
  constructor(private userService: UserService) {}

  @SerializeOptions({
    groups: ['admin'],
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(RoleEnum.admin) // Admin 역할 또는
  @Permissions('users:create') // 사용자 생성 권한이 있어야 함
  create(@Body() createProfileDto: CreateUserDto): Promise<UserEntity> {
    return this.userService.create(createProfileDto);
  }

  @SerializeOptions({
    groups: ['admin'],
  })
  @Get('/')
  @CanReadUsers() // 사용자 읽기 권한 체크
  async hello(): Promise<UserEntity[]|null> {
    return await this.userService.getUser();
  }

  @SerializeOptions({
    groups: ['admin'],
  })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @CanReadUsers() // 사용자 읽기 권한 체크
  findOne(@Param('id', ParseIntPipe) id: number): Promise<NullableType<UserEntity>> {
    return this.userService.findOne({ id: id });
  }

  @SerializeOptions({
    groups: ['admin'],
  })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @CanWriteUsers() // 사용자 수정 권한 체크
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProfileDto: UpdateUserDto,
  ): Promise<UserEntity> {
    return this.userService.update(id, updateProfileDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @CanDeleteUsers() // 사용자 삭제 권한 체크
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.softDelete(id);
  }
}
