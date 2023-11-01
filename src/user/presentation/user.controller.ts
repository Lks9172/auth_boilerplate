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
  signUp(@Body() createUserDto: CreateUserDto): string {
    console.log(createUserDto);
    return 'hi';
  }

  @Get('/')
  hello() {
    return 'Hello server';
  }
}
