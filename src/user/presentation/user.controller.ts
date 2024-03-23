import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import { User } from '../domain/user.entity';
import { CreateUserDto } from '../application/dto/create-user.dto';
import { UserService } from '../application/user.service';
import { RolesGuard } from '../../roles/roles.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
}
