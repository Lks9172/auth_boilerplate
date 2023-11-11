import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { User } from '../domain/user.entity';
import { CreateUserDto } from '../application/dto/createUser.dto';
import { UserService } from '../application/user.service';
import { KakaoTokenGenerator, NaverTokenGenerator, GoogleTokenGenerator } from '../application/register';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/')
  @UsePipes(ValidationPipe)
  signUp(@Body() user: CreateUserDto): Promise<User> {
    const userInfo = this.userService.normalizeUser(user);
    return this.userService.createUser(userInfo.socialType, userInfo);
  }

  @Get('/')
  @UsePipes(ValidationPipe)
  async lo(@Query('code') code: string): Promise<string> {
    const generator = new GoogleTokenGenerator(code);
    const token = await generator.verifyOauthMember();
    console.log(token);
    return token;
  }

  // `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=841e625dbb6cf7cf348f3d20856fa1b3&redirect_uri=http://localhost:3000/user/login`


  // @Get('/')
  // hello() {
  //   return 'Hello server';
  // }
}
