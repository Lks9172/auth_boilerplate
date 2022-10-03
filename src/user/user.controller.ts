import { Body, Controller, Delete, Post, Put, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dto/create-user.dto'
import { SignInUserDto } from './dto/SignIn-user.dto'
import { tChangePwRes, tLoginRes } from './dto/types'
import { GetUser } from './get-user.decorator';
import { User } from './user.entity'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  
  @Post('/')
  @UsePipes(ValidationPipe)
  signUp(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.createAccount(createUserDto)
  }

  @Post('/login')
  @UsePipes(ValidationPipe)
  signIn(@Body() signInUserDto: SignInUserDto): Promise<tLoginRes> {
    return this.userService.login(signInUserDto)
  }

  @Put('/password')
  @UseGuards(AuthGuard())
  @UsePipes(ValidationPipe)
  async changePassword(
    @GetUser() user:User,
    @Body() changePwUserDto: SignInUserDto,
    ): Promise<tChangePwRes | undefined> {
    const res = await this.userService.updatePassword(user, changePwUserDto)
    return {
      success: res
    }
  }

  @Delete('/')
  @UseGuards(AuthGuard())
  @UsePipes(ValidationPipe)
  async deleteUser(
    @GetUser() user:User,
    @Body() deleteUserDto: SignInUserDto
    ): Promise<tChangePwRes> {
    const res = await this.userService.deleteUser(user, deleteUserDto)
    return {
      success: res
    }
  }

  @Post('/test')
  @UseGuards(AuthGuard())
  test(@GetUser() user:User) {
      console.log(user);
  }
}
