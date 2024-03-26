import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthRegisterLoginDto } from '../../auth/application/dto/auth-register-login.dto';
import { AuthService } from '../../auth/application/auth.service';
import { UserService } from '../../user/application/user.service';
import { User } from '../../user/domain/user.entity';
import { SessionService } from '../../session/session.service';
import { MailService } from '../../mail/application/mail.service';
import { MailerService } from '../../mailer/application/mailer.service';
import mailConfig from '../../mail/config/mail.config';
import MockUser from '../utils/mock-user';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let mailService: MailService;
  let mailerService: MailerService;
  let sessionService: SessionService;
  let configService: ConfigService;


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
            create: jest.fn(), 
          },
        },
        {
          provide: MailService,
          useValue: {
            userSignUp: jest.fn(),
          },
        },
        {
          provide: SessionService,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('testToken'),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn()
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key) => {
              if (key === 'JWT_SECRET') return 'secretKey';
            }),
            getOrThrow: jest.fn().mockImplementation((key) => {
              return key;
            }),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn().mockReturnValue(new MockUser()),
            save: jest.fn().mockResolvedValue(new MockUser()),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    mailService = module.get<MailService>(MailService);
    mailerService = module.get<MailerService>(MailerService);
    sessionService = module.get<SessionService>(SessionService);
    configService = module.get<ConfigService>(ConfigService);

  });

  describe('register', () => {
    beforeEach(async () => {
      jest.spyOn(mailerService, 'sendMail').mockImplementation(() => Promise.resolve());
      jest.spyOn(userService, 'create').mockResolvedValue(new MockUser() as unknown as User);
    });

    it('should be defined', () => {
      expect(authService.register).toBeDefined();
    });

    it('type check', () => {
      expect(typeof authService.register).toBe('function');
    });

    it('should register a new user and return a undefined', async () => {
      const authRegisterLoginDto: AuthRegisterLoginDto = {
        email: 'test@example.com',
        password: 'hashedpassword',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = await authService.register(authRegisterLoginDto);
      expect(result).toEqual(undefined);
    });
  });
});
