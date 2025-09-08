import { HttpException, HttpStatus, Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { UserServicePort, USER_SERVICE } from '../../user/domain/ports/user.service.port';
import { ConfigService } from '@nestjs/config';
import { Status } from '../../statuses/entities/status.entity';
import { StatusEnum } from '../../statuses/statuses.enum';
import { AllConfigType } from '../../config/config.type';
import { MailService } from '../../mail/application/mail.service';
import { UserEntity } from '../../user/infrastructure/entities/user.entity';
import { plainToClass } from 'class-transformer';
import bcrypt from 'bcryptjs';
import ms from 'ms';
import { AuthProvidersEnum } from '../domain/auth-providers.enum';
import { Session } from '../../session/entities/session.entity';
import { SessionService } from '../../session/application/session.service';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { LoginResponseType } from '../types/login-response.type';
import { JwtRefreshPayloadType } from '../types/jwt-refresh-payload.type';
import { SocialInterface } from '../../social/interfaces/social.interface';
import { NullableType } from '../../utils/types/nullable.type';

// Use UserEntity instead of domain User
type User = UserEntity;
import { Role } from '../../roles/entities/role.entity';
import { RoleEnum } from '../../roles/roles.enum';
import { JwtPayloadType } from '../strategies/types/jwt-payload.type';
import { AuthUpdateDto } from './dto/auth-update.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @Inject(USER_SERVICE)
    private userService: UserServicePort,
    private sessionService: SessionService,
    private mailService: MailService,
    private configService: ConfigService<AllConfigType>,
  ) {}

  async validateLogin(loginDto: AuthEmailLoginDto): Promise<LoginResponseType> {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'notFound',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (user.provider !== AuthProvidersEnum.email) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: `needLoginViaProvider:${user.provider}`,
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      user.password || '',
    );

    if (!isValidPassword) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            password: 'incorrectPassword',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const session = await this.sessionService.create({
      user,
    });

    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: user.id as number,
      role: user.role || null,
      sessionId: session.id,
    });

    return {
      refreshToken,
      token,
      tokenExpires,
      user,
    };
  }

  async register(dto: AuthRegisterLoginDto): Promise<void> {

    const user = await this.userService.create({
      ...dto,
      email: dto.email,
      provider: AuthProvidersEnum.email,
      statusId: StatusEnum.inactive,
      roleIds: [RoleEnum.user],
    });

    const signOptions = {
      payload: {
        confirmEmailUserId: user.id as number,
      },
      options: {
        secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
          infer: true,
        }),
        expiresIn: this.configService.getOrThrow('auth.confirmEmailExpires', {
          infer: true,
        }),
      },
    };
    const hash = await this.jwtService.signAsync(
      signOptions.payload,
      signOptions.options
      );

    await this.mailService.userSignUp({
      to: dto.email,
      data: {
        hash,
      },
    });
  }

  async validateSocialLogin(
    authProvider: string,
    socialData: SocialInterface,
  ): Promise<LoginResponseType> {
    let user: NullableType<User> = null;
    const socialEmail = socialData.email?.toLowerCase();
    let userByEmail: NullableType<User> = null;

    if (socialEmail) {
      userByEmail = await this.userService.findByEmail(socialEmail);
    }

    if (socialData.id) {
      user = await this.userService.findBySocialId(socialData.id);
    }

    if (user) {
      if (socialEmail && !userByEmail) {
      // 요기가 새로운 소셜 데이터 이메일 & old 소셜 유저
        user.email = socialEmail;
      }
      await this.userService.update(user.id as number, {
        email: user.email || undefined,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
      });
    } else if (userByEmail) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'email already exists with a different provider.',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
      // user = userByEmail;
    } else {
      const role = plainToClass(Role, {
        id: RoleEnum.user,
      });
      const status = plainToClass(Status, {
        id: StatusEnum.active,
      });

      user = await this.userService.create({
        email: socialEmail ?? undefined,
        firstName: socialData.firstName ?? undefined,
        lastName: socialData.lastName ?? undefined,
        socialId: socialData.id,
        provider: authProvider,
        statusId: StatusEnum.active,
        roleIds: [RoleEnum.user],
      });
    }

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            user: 'userNotFound',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const session = await this.sessionService.create({
      user,
    });

    const {
      token: jwtToken,
      refreshToken,
      tokenExpires,
    } = await this.getTokensData({
      id: user.id as number,
      role: user.role || null,
      sessionId: session.id,
    });

    return {
      refreshToken,
      token: jwtToken,
      tokenExpires,
      user,
    };
  }

  async confirmEmail(hash: string): Promise<void> {
    let userId: User['id'];

    try {
      const jwtData = await this.jwtService.verifyAsync<{
        confirmEmailUserId: User['id'];
      }>(hash, {
        secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
          infer: true,
        }),
      });

      userId = jwtData.confirmEmailUserId;
    } catch {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            hash: 'invalidHash',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const user = await this.userService.findById(userId);

    if (!user || user?.status?.id !== StatusEnum.inactive) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'notFound',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Status will be updated via userService.update
    await this.userService.update(user.id as number, {
      statusId: StatusEnum.active,
    });
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'emailNotExists',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const hash = await this.jwtService.signAsync(
      {
        forgotUserId: user.id as number,
      },
      {
        secret: this.configService.getOrThrow('auth.forgotSecret', {
          infer: true,
        }),
        expiresIn: this.configService.getOrThrow('auth.forgotExpires', {
          infer: true,
        }),
      },
    );

    await this.mailService.forgotPassword({
      to: email,
      data: {
        hash,
      },
    });
  }

  async refreshToken(
    data: Pick<JwtRefreshPayloadType, 'sessionId'>,
  ): Promise<Omit<LoginResponseType, 'user'>> {
    const session = await this.sessionService.findOne({
      where: {
        id: data.sessionId,
      },
    });

    if (!session) {
      throw new UnauthorizedException();
    }

    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: session.user.id,
      role: session.user.role,
      sessionId: session.id,
    });

    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }

  async softDelete(user: User): Promise<void> {
    await this.userService.delete(user.id as number);
  }

  async resetPassword(hash: string, password: string): Promise<void> {
    let userId: User['id'];

    try {
      const jwtData = await this.jwtService.verifyAsync<{
        forgotUserId: User['id'];
      }>(hash, {
        secret: this.configService.getOrThrow('auth.forgotSecret', {
          infer: true,
        }),
      });

      userId = jwtData.forgotUserId;
    } catch {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            hash: 'invalidHash',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const user = await this.userService.findById(userId);

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            hash: 'notFound',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    await this.sessionService.softDelete({
      user: {
        id: user.id as number,
      },
    });
    await this.userService.update(user.id as number, {
      password: password,
    });
  }

  async findMe(userJwtPayload: JwtPayloadType): Promise<NullableType<User>> {
    return this.userService.findById(userJwtPayload.id);
  }

  async update(
    userJwtPayload: JwtPayloadType,
    userDto: AuthUpdateDto,
  ): Promise<NullableType<User>> {
    if (userDto.password) {
      if (!userDto.oldPassword) {
        throw new HttpException(
          {
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            errors: {
              oldPassword: 'missingOldPassword',
            },
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      const currentUser = await this.userService.findById(userJwtPayload.id);

      if (!currentUser) {
        throw new HttpException(
          {
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            errors: {
              user: 'userNotFound',
            },
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      const isValidOldPassword = await bcrypt.compare(
        userDto.oldPassword,
        currentUser.password || '',
      );

      if (!isValidOldPassword) {
        throw new HttpException(
          {
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            errors: {
              oldPassword: 'incorrectOldPassword',
            },
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      } else {
        await this.sessionService.softDelete({
          user: {
            id: currentUser.id,
          },
          excludeId: userJwtPayload.sessionId,
        });
      }
    }

    await this.userService.update(userJwtPayload.id, userDto);

    return this.userService.findById(userJwtPayload.id);
  }

  private async getTokensData(data: {
    id: User['id'];
    role: User['role'];
    sessionId: Session['id'];
  }) {
    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    });

    const tokenExpires = Date.now() + (ms as any)(tokenExpiresIn);

    const [token, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(
        {
          id: data.id,
          role: data.role,
          sessionId: data.sessionId,
        },
        {
          secret: this.configService.getOrThrow('auth.secret', { infer: true }),
          expiresIn: tokenExpiresIn,
        },
      ),
      await this.jwtService.signAsync(
        {
          sessionId: data.sessionId,
        },
        {
          secret: this.configService.getOrThrow('auth.refreshSecret', {
            infer: true,
          }),
          expiresIn: this.configService.getOrThrow('auth.refreshExpires', {
            infer: true,
          }),
        },
      ),
    ]);

    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }

  async logout(data: Pick<JwtRefreshPayloadType, 'sessionId'>) {
    return this.sessionService.softDelete({
      id: data.sessionId,
    });
  }
}
