import {
  Post,
  HttpCode,
  Body,
  Controller,
  HttpStatus,
  Query,
  Get,
  SerializeOptions
} from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthRegisterLoginDto } from '../application/dto/auth-register-login.dto';
import { AuthConfirmEmailDto } from '../application/dto/auth-confirm-email.dto';
import { AuthEmailLoginDto } from '../application/dto/auth-email-login.dto';
import { LoginResponseType } from '../types/login-response.type';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('email/login')
  @HttpCode(HttpStatus.OK)
  public login(
    @Body() loginDto: AuthEmailLoginDto,
  ): void {
    return;
  }

  @Post('email/register')
  @HttpCode(HttpStatus.NO_CONTENT)
  async register(@Body() createUserDto: AuthRegisterLoginDto): Promise<void> {
    return this.service.register(createUserDto);
  }

  @Get('email/confirm')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmEmail(
    @Query() confirmEmailDto: AuthConfirmEmailDto,
  ): Promise<void> {
    return this.service.confirmEmail(confirmEmailDto.hash);
  }
}
