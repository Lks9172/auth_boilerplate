import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}
    
    @Post('/signup')
    @UsePipes(ValidationPipe)
    signUp(@Body() createUserDto: CreateUserDto): Promise<User> {
      return this.userService.createAccount(createUserDto);
    }
}
