import {
  Post,
  HttpCode,
  Body,
  Controller,
  HttpStatus,
  Query,
  Get,
} from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthRegisterLoginDto } from '../application/dto/auth-register-login.dto';
import { AuthConfirmEmailDto } from '../application/dto/auth-confirm-email.dto';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly service: AuthService) {}

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
