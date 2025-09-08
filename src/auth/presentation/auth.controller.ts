import {
  Post,
  HttpCode,
  Request,
  Body,
  Controller,
  HttpStatus,
  Query,
  Get,
  UseGuards,
  SerializeOptions,
  Patch,
  Delete
} from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthRegisterLoginDto } from '../application/dto/auth-register-login.dto';
import { AuthConfirmEmailDto } from '../application/dto/auth-confirm-email.dto';
import { AuthEmailLoginDto } from '../application/dto/auth-email-login.dto';
import { LoginResponseType } from '../types/login-response.type';
import { AuthGuard } from '@nestjs/passport';
import { AuthForgotPasswordDto } from '../application/dto/auth-forgot-password.dto';
import { AuthResetPasswordDto } from '../application/dto/auth-reset-password.dto';
import { OAuthLoginDto } from '../../oauth/dto/oauth-login.dto';
import { OAuthFactory } from '../../oauth/factories/oauth.factory';
import { AuthProvidersEnum } from '../domain/auth-providers.enum';
import { NullableType } from 'src/utils/types/nullable.type';
import { UserEntity } from 'src/user/infrastructure/entities/user.entity';
import { AuthUpdateDto } from '../application/dto/auth-update.dto';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(
    private readonly service: AuthService,
    private readonly oAuthFactory: OAuthFactory,
  ) {}

  @Post('email/login')
  @HttpCode(HttpStatus.OK)
  public login(
    @Body() loginDto: AuthEmailLoginDto,
  ): Promise<LoginResponseType> {
    return this.service.validateLogin(loginDto);
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

  @Post('forgot/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async forgotPassword(
    @Body() forgotPasswordDto: AuthForgotPasswordDto,
  ): Promise<void> {
    return this.service.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  resetPassword(@Body() resetPasswordDto: AuthResetPasswordDto): Promise<void> {
    return this.service.resetPassword(
      resetPasswordDto.hash,
      resetPasswordDto.password,
    );
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  public findMe(@Request() request): Promise<NullableType<UserEntity>> {
    return this.service.findMe(request.user);
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  public refresh(@Request() request): Promise<Omit<LoginResponseType, 'user'>> {
    return this.service.refreshToken({
      sessionId: request.user.sessionId,
    });
  }

  @ApiBearerAuth()
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(@Request() request): Promise<void> {
    await this.service.logout({
      sessionId: request.user.sessionId,
    });
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  public update(
    @Request() request,
    @Body() userDto: AuthUpdateDto,
  ): Promise<NullableType<UserEntity>> {
    return this.service.update(request.user, userDto);
  }

  @ApiBearerAuth()
  @Delete('me')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(@Request() request): Promise<void> {
    return this.service.softDelete(request.user);
  }
   
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('social/login')
  @HttpCode(HttpStatus.OK)
  async socailLogin(
    @Body() loginDto: OAuthLoginDto,
  ): Promise<LoginResponseType> {
    const provider: AuthProvidersEnum = AuthProvidersEnum[loginDto.social as keyof typeof AuthProvidersEnum];
    
    const socialService = this.oAuthFactory.getOAuthService(provider);
    const socialData = await socialService.getProfileByToken(loginDto);

    return this.service.validateSocialLogin(loginDto.social, socialData);
  }
}
