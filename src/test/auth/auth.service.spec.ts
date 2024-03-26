import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/application/auth.service';
import { UserService } from '../../user/application/user.service';
import { User } from '../../user/domain/user.entity';
import { SessionService } from '../../session/session.service';
import { MailService } from '../../mail/application/mail.service';
import { MailerService } from '../../mailer/application/mailer.service';
import mailConfig from '../../mail/config/mail.config';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports:[
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            mailConfig,
          ]
        })
      ],
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
          },
        },
        {
          provide: MailService,
          useValue: {
          },
        },
        {
          provide: SessionService,
          useValue: {
          },
        },
        {
          provide: JwtService,
          useValue: {
          },
        },
        {
          provide: ConfigService,
          useValue: {
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
          },
        },
        {
          provide: MailerService,
          useValue: {
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

});
