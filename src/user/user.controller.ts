import { Body, Controller, Get, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common'
import { ChangePwUserDto } from './dto/changePw-user.dto'
import { CreateUserDto } from './dto/create-user.dto'
import { SignInUserDto } from './dto/SignIn-user.dto'
import { tChangePwRes, tLoginRes } from './dto/types'
import { User } from './user.entity'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}
    
    @Post('/signup')
    @UsePipes(ValidationPipe)
    signUp(@Body() createUserDto: CreateUserDto): Promise<User> {
      return this.userService.createAccount(createUserDto)
    }

    @Post('/signin')
    @UsePipes(ValidationPipe)
    signIn(@Body() signInUserDto: SignInUserDto): Promise<tLoginRes> {
      return this.userService.signIn(signInUserDto)
    }

    @Put('/changePassword')
    @UsePipes(ValidationPipe)
    async changePassword(@Body() changePwUserDto: ChangePwUserDto): Promise<tChangePwRes> {
      const res = await this.userService.updatePassword(changePwUserDto)
      return {
        success: res
      }
    }
}
