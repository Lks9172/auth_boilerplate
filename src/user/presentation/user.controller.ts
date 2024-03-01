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
import { SignInUserDto } from '../application/dto/signInUser.dto';
import { tLoginRes } from '../application/dto/types';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/')
  @UsePipes(ValidationPipe)
  signUp(@Body() user: CreateUserDto): Promise<User> {
    const userInfo = this.userService.normalizeUser(user);
    return this.userService.createUser(userInfo.socialType, userInfo);
  }

  @Post('/signin')
  @UsePipes(ValidationPipe)
  async signIn(@Body() user: SignInUserDto): Promise<tLoginRes> {
    const auth = await this.userService.signIn(user);
    const token = {
      email: auth.user.email,
      accessToken: auth.jwt.accessToken,
      refreshToken: auth.jwt.refreshToken,
    };
    return token;
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
