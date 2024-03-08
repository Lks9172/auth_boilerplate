import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { User } from '../domain/user.entity';
import { CreateUserDto } from '../application/dto/create-user.dto';
import { UserService } from '../application/user.service';
import { KakaoTokenGenerator, NaverTokenGenerator, GoogleTokenGenerator } from '../application/register';
import { SignInUserDto } from '../application/dto/signInUser.dto';
import { tLoginRes } from '../application/dto/types';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@Controller({
  path: 'user',
  version: '1',
})
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/')
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.CREATED)
  signUp(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  // @Get('/')
  // @UsePipes(ValidationPipe)
  // async lo(@Query('code') code: string): Promise<string> {
  //   const generator = new GoogleTokenGenerator(code);
  //   const token = await generator.verifyOauthMember();
  //   console.log(token);
  //   return token;
  // }

  @Get('/')
  async hello(): Promise<User[]|null> {
    return await this.userService.getUser();
  }
}
