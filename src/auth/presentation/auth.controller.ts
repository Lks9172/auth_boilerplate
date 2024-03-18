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
  SerializeOptions
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
import { OAuthGoogleLoginDto } from '../../oauth/dto/oauth-google-login.dto';
import { OAuthFactory } from '../../oauth/factories/oauth.factory';
import { AuthProvidersEnum } from '../domain/auth-providers.enum';

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

  @SerializeOptions({
    groups: ['me'],
  })
  @Post('social/login')
  @HttpCode(HttpStatus.OK)
  async socailLogin(
    @Body() loginDto: OAuthGoogleLoginDto,
  ): Promise<LoginResponseType> {
    const provider: AuthProvidersEnum = AuthProvidersEnum[loginDto.social as keyof typeof AuthProvidersEnum];

    const socialService = this.oAuthFactory.getOAuthService(provider);
    const socialData = await socialService.getProfileByToken(loginDto);

    return this.service.validateSocialLogin(loginDto.social, socialData);
  }

}
