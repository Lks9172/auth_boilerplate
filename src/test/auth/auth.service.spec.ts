import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
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
import bcrypt from 'bcryptjs';
import MockSession from '../utils/mock-session';
import { Session } from '../../session/entities/session.entity';
import { HttpException, HttpStatus } from '@nestjs/common';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let mailService: MailService;
  let mailerService: MailerService;
  let sessionService: SessionService;
  let jwtService: JwtService;

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
            findOne: jest.fn()
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
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
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
            get: jest.fn(),
            getOrThrow: jest.fn().mockImplementation((key) => {
              if (key === 'auth.confirmEmailSecret') return 'Secret';
              if (key === 'auth.confirmEmailExpires') return '1d';
              if (key === 'auth.expires') return '30m';
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
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validateLogin', () => {
    const user = new MockUser() as unknown as User;
    const loginDto = {
      email: user.email as string,
      password: user.password
    };
    const session = new MockSession() as unknown as Session;
    
    beforeEach(async () => {
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      jest.spyOn(userService, 'findOne').mockResolvedValue(user);
      jest.spyOn(sessionService, 'create').mockResolvedValue(session);
      jest.spyOn(jwtService, 'signAsync').mockImplementation((payload, options) => {
        if ('id' in payload) {
          return Promise.resolve('jwtToken');
        } else {
          return Promise.resolve('refreshToken');
        }
      });
    });

    it('should be defined', () => {
      expect(authService.validateLogin).toBeDefined();
    });

    it('type check', () => {
      expect(typeof authService.validateLogin).toBe('function');
    });

    it('check called time', async () => {
      await authService.validateLogin(loginDto);

      expect(userService.findOne).toBeCalledTimes(1);
      expect(bcrypt.compare).toBeCalledTimes(1);
      expect(sessionService.create).toBeCalledTimes(1);
    });

    it('check called with parameter', async () => {
      await authService.validateLogin(loginDto);

      expect(userService.findOne).toBeCalledWith({email: loginDto.email});
      expect(bcrypt.compare).toBeCalledWith(loginDto.password, user.password);
      expect(sessionService.create).toBeCalledWith({user});
    });

    it('check Can\'t find user with email', async () => {
      const error_422 = new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'notFound',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
      
      jest.spyOn(userService, 'findOne').mockResolvedValue(null);
      const res = await authService.validateLogin(loginDto)
      .catch((e) => e);
      
      expect(res).toStrictEqual(error_422);
    });
  });

  describe('register', () => {
    const authRegisterLoginDto: AuthRegisterLoginDto = {
      email: 'test@example.com',
      password: 'hashedpassword',
      firstName: 'John',
      lastName: 'Doe',
    };
    const createUserDto = {
      email: 'test@example.com',
      password: 'hashedpassword',
      firstName: 'John',
      lastName: 'Doe',
      role: {
        id: 2,
      },
      status: {
        id: 2,
      },
    };
    const signOptions = {
      payload: {
        confirmEmailUserId: 1,
      },
      options: {
        secret: 'Secret',
        expiresIn: '1d',
      },
    };

    beforeEach(async () => {
      jest.spyOn(mailerService, 'sendMail').mockImplementation(() => Promise.resolve());
      jest.spyOn(userService, 'create').mockResolvedValue(new MockUser() as unknown as User);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('testToken');
    });

    it('should be defined', () => {
      expect(authService.register).toBeDefined();
    });

    it('type check', () => {
      expect(typeof authService.register).toBe('function');
    });

    it('check called time', async () => {
      await authService.register(authRegisterLoginDto);
      expect(userService.create).toBeCalledTimes(1);
      expect(jwtService.signAsync).toBeCalledTimes(1);
      expect(mailService.userSignUp).toBeCalledTimes(1);
    });

    it('check called with parameter', async () => {
      await authService.register(authRegisterLoginDto);

      expect(userService.create).toBeCalledWith(createUserDto);
      expect(jwtService.signAsync).toBeCalledWith(signOptions.payload, signOptions.options);
      expect(mailService.userSignUp).toBeCalledWith({
        to: authRegisterLoginDto.email,
        data: {
          hash: 'testToken'
        }
      });
    });

    it('check return the correct value', async () => {
      const result = await authService.register(authRegisterLoginDto);
      expect(result).toEqual(undefined);
    });
  });
});
