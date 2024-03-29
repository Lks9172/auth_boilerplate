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
import { User } from '../domain/user.entity';
import { CreateUserDto } from '../application/dto/create-user.dto';
import { UserService } from '../application/user.service';
import { RolesGuard } from '../../roles/roles.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NullableType } from '../../utils/types/nullable.type';
import { UpdateUserDto } from '../application/dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../roles/roles.decorator';
import { RoleEnum } from '../../roles/roles.enum';

@ApiBearerAuth()
@Roles(RoleEnum.admin)
@ApiTags('User')
@UseGuards(AuthGuard('jwt'), RolesGuard)
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
  create(@Body() createProfileDto: CreateUserDto): Promise<User> {
    return this.userService.create(createProfileDto);
  }

  @SerializeOptions({
    groups: ['admin'],
  })
  @Get('/')
  async hello(): Promise<User[]|null> {
    return await this.userService.getUser();
  }

  @SerializeOptions({
    groups: ['admin'],
  })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number): Promise<NullableType<User>> {
    return this.userService.findOne({ id: id });
  }

  @SerializeOptions({
    groups: ['admin'],
  })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProfileDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(id, updateProfileDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.softDelete(id);
  }
}
