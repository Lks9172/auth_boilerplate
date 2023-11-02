import {
  Body,
  Controller,
  Get,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { User } from '../domain/user.entity';
import { CreateUserDto } from '../application/dto/createUser.dto';
import { UserService } from '../application/user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/')
  @UsePipes(ValidationPipe)
  signUp(@Body() userInfo: CreateUserDto): Promise<User> {
    this.userService.setUserInfo(userInfo);
    console.log();
    return this.userService.createUser(userInfo);
  }

  @Get('/')
  hello() {
    return 'Hello server';
  }
}
