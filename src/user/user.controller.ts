import { Body, Controller, Delete, Get, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common'
import { ChangePwUserDto } from './dto/changePw-user.dto'
import { CreateUserDto } from './dto/create-user.dto'
import { SignInUserDto } from './dto/SignIn-user.dto'
import { tChangePwRes, tLoginRes } from './dto/types'
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
    @UsePipes(ValidationPipe)
    async changePassword(@Body() changePwUserDto: ChangePwUserDto): Promise<tChangePwRes> {
      const res = await this.userService.updatePassword(changePwUserDto)
      return {
        success: res
      }
    }

    @Delete('/')
    @UsePipes(ValidationPipe)
    async deleteUser(@Body() deleteUserDto: ChangePwUserDto): Promise<tChangePwRes> {
      const res = await this.userService.deleteUser(deleteUserDto)
      return {
        success: res
      }
    }

    // @Get('/logout')
    // @UsePipes(ValidationPipe)
    // async logout(@Body() changePwUserDto: ChangePwUserDto): Promise<tChangePwRes> {
    //   const res = await this.userService.updatePassword(changePwUserDto)
    //   return {
    //     success: res
    //   }
    // }
}
