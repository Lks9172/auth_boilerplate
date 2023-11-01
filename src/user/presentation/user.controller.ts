import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../domain/user.entity';
import { CreateUserDto } from '../application/dto/createUser.dto';
import { tChangePwRes, tLoginRes } from '../application/dto/types';
import { UserService } from '../application/user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  // @Post('/')
  // @UsePipes(ValidationPipe)
  // signUp(@Body() createUserDto: CreateUserDto): Promise<User> {
  //   return this.userService.createAccount(createUserDto);
  // }

  @Get('/')
  hello() {
    return 'Hello server';
  }
}
