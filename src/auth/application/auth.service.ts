import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { UserService } from '../../user/application/user.service';
import { ConfigService } from '@nestjs/config';
import { Status } from '../../statuses/entities/status.entity';
import { StatusEnum } from '../../statuses/statuses.enum';
import { AllConfigType } from '../../config/config.type';
import { MailService } from '../../mail/application/mail.service';
import { User } from 'src/user/domain/user.entity';
import { plainToClass } from 'class-transformer';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private mailService: MailService,
    private configService: ConfigService<AllConfigType>,
  ) {}

  async register(dto: AuthRegisterLoginDto): Promise<void> {

    const user = await this.userService.create({
      ...dto,
      email: dto.email,
      status: {
        id: StatusEnum.inactive,
      } as Status,
    });

    const hash = await this.jwtService.signAsync(
      {
        confirmEmailUserId: user.id,
      },
      {
        secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
          infer: true,
        }),
        expiresIn: this.configService.getOrThrow('auth.confirmEmailExpires', {
          infer: true,
        }),
      },
    );

    await this.mailService.userSignUp({
      to: dto.email,
      data: {
        hash,
      },
    });
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

    const user = await this.userService.findOne({
      id: userId,
    });

    if (!user || user?.status?.id !== StatusEnum.inactive) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'notFound',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    user.status = plainToClass(Status, {
      id: StatusEnum.active,
    });
    await user.save();
  }
}
