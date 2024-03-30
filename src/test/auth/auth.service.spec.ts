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
import { MockUser, MockSocialUser, MockInActiveUser } from '../utils/mock-user';
import bcrypt from 'bcryptjs';
import ms from 'ms';
import MockSession from '../utils/mock-session';
import { Session } from '../../session/entities/session.entity';
import { HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { RoleEnum } from '../../roles/roles.enum';
import { Role } from '../../roles/entities/role.entity';
import { Status } from '../../statuses/entities/status.entity';
import { StatusEnum } from '../../statuses/statuses.enum';
import { AuthUpdateDto } from '../../auth/application/dto/auth-update.dto';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  const signOptions = {
    payload: {
      confirmEmailUserId: 1,
    },
    options: {
      secret: 'Secret',
      expiresIn: '1d',
    },
  };
  const mockDate = new Date(2024, 1, 1).getTime(); // 원하는 날짜로 설정
  jest.spyOn(Date, 'now').mockImplementation(() => mockDate);
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
            findOne: jest.fn(),
            update: jest.fn(),
            save: jest.fn(),
            softDelete: jest.fn()
          },
        },
        {
          provide: MailService,
          useValue: {
            userSignUp: jest.fn(),
            forgotPassword: jest.fn()
          },
        },
        {
          provide: SessionService,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            softDelete: jest.fn()
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn()
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
              if (key === 'auth.forgotSecret') return 'secret_for_forgot_pw';
              if (key === 'auth.forgotExpires') return '30m';
              if (key === 'auth.secret') return 'secret';
              if (key === 'auth.refreshSecret') return 'refresh_secret';
              if (key === 'auth.refreshExpires') return '30m';
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
      jest.spyOn(jwtService, 'signAsync').mockImplementation((payload) => {
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
      const error422Email = new HttpException(
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
      
      expect(res).toStrictEqual(error422Email);
    });

    it('check user\'s provider is not email', async () => {
      const error422Provider = new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: `needLoginViaProvider:${user.provider}`,
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
      const t_user = {...user, provider: 'google'} as User;
      jest.spyOn(userService, 'findOne').mockResolvedValue(t_user);
      
      const res = await authService.validateLogin(loginDto)
      .catch((e) => e);

      expect(res).toStrictEqual(error422Provider);
    });

    it('check match user\'s password', async () => {
      const error422Pw = new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            password: 'incorrectPassword',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
      bcrypt.compare = jest.fn().mockResolvedValue(false);
      
      const res = await authService.validateLogin(loginDto)
      .catch((e) => e);

      expect(res).toStrictEqual(error422Pw);
    });

    it('check return the correct value', async () => {
      const returnValue = {
        refreshToken: 'refreshToken',
        token: 'jwtToken',
        tokenExpires: Date.now() + ms('30m'),
        user: user
      };
      const res = await authService.validateLogin(loginDto);
      
      expect(res).toEqual(returnValue);
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

  describe('validateSocialLogin', () => {
    const user = new MockUser() as unknown as User;
    const newSocialUser = {...user, email: 'newemail@naver.com', provider: 'kakao'} as User;
    const mockSocialUser = new MockSocialUser() as unknown as User;
    const originUser = {...user, socialId:'1', email: 'origin@naver.com', provider: 'kakao'} as User;
    const session = new MockSession() as unknown as Session;
    const socialData = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'testemail@naver.com'
    };
    const genUserInfo ={
      email: socialData.email ?? null,
      firstName: socialData.firstName ?? null,
      lastName: socialData.lastName ?? null,
      socialId: socialData.id,
      provider: 'kakao',
      role:plainToClass(Role, {
        id: RoleEnum.user,
      }),
      status: plainToClass(Status, {
        id: StatusEnum.active,
      }),
    };
    const userEmail = {
      email: socialData.email
    };
    const userSocial = {
      socialId: socialData.id,
      provider: 'kakao'
    };

    beforeEach(async () => {
      jest.spyOn(userService, 'update').mockResolvedValue(new MockUser() as unknown as User);
      jest.spyOn(sessionService, 'create').mockResolvedValue(session);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('testToken');
    });

    it('should be defined', async () => {
      expect(authService.validateSocialLogin).toBeDefined();
    });

    it('type check', () => {
      expect(typeof authService.validateSocialLogin).toBe('function');
    });

    it('called with parameter at login new user', async () => {
      jest.spyOn(userService, 'findOne').mockImplementation(() => {
          return Promise.resolve(null);
      });
      jest.spyOn(userService, 'create').mockResolvedValue(newSocialUser as User);

      await authService.validateSocialLogin('kakao', socialData);
      expect(userService.findOne).toHaveBeenNthCalledWith(1, userEmail);
      expect(userService.findOne).toHaveBeenNthCalledWith(2, userSocial);
      expect(userService.create).toHaveBeenCalledWith(genUserInfo as User);
      expect(sessionService.create).toHaveBeenCalledWith({user: newSocialUser as User});
    });

    it('check with parameter at social login old user', async () => {
      jest.spyOn(userService, 'findOne').mockImplementation((fields) => {
        if ('email' in fields)
          return Promise.resolve(newSocialUser);
        else if ('socialId' in fields)
          return Promise.resolve(newSocialUser);
        else
          return Promise.resolve(null);
      });
      jest.spyOn(userService, 'update').mockResolvedValue(newSocialUser as User);

      await authService.validateSocialLogin('kakao', socialData);
      expect(userService.findOne).toHaveBeenNthCalledWith(1, userEmail);
      expect(userService.findOne).toHaveBeenNthCalledWith(2, userSocial);
      expect(userService.update).toHaveBeenCalledWith(newSocialUser.id, newSocialUser);
      expect(sessionService.create).toHaveBeenCalledWith({user: newSocialUser as User});
    });

    it('check with parameter at origin social user changed social id', async () => {
      jest.spyOn(userService, 'findOne').mockImplementation((fields) => {
        if ('socialId' in fields)
          return Promise.resolve(newSocialUser);
        else
          return Promise.resolve(null);
      });
      jest.spyOn(userService, 'update').mockResolvedValue(newSocialUser as User);

      await authService.validateSocialLogin('kakao', socialData);
      expect(userService.findOne).toHaveBeenNthCalledWith(1, userEmail);
      expect(userService.findOne).toHaveBeenNthCalledWith(2, userSocial);
      expect(userService.update).toHaveBeenCalledWith(newSocialUser.id, newSocialUser);
      expect(sessionService.create).toHaveBeenCalledWith({user: newSocialUser as User});
    });

    it('check return value at login new user', async () => {
      jest.spyOn(userService, 'findOne').mockImplementation(() => {
          return Promise.resolve(null);
      });
      jest.spyOn(userService, 'create').mockResolvedValue(newSocialUser as User);

      const res = await authService.validateSocialLogin('kakao', socialData);
      expect(res).toEqual({
        refreshToken: 'testToken',
        token: 'testToken',
        tokenExpires: Date.now() + ms('30m'),
        user: newSocialUser as User,
      });      
    });

    it('check return value at social login old user', async () => {
      jest.spyOn(userService, 'findOne').mockImplementation((fields) => {
        if ('email' in fields)
          return Promise.resolve(newSocialUser);
        else if ('socialId' in fields)
          return Promise.resolve(newSocialUser);
        else
          return Promise.resolve(null);
      });
      jest.spyOn(userService, 'update').mockResolvedValue(newSocialUser as User);

      const res = await authService.validateSocialLogin('kakao', socialData);
      
      expect(res).toEqual({
        refreshToken: 'testToken',
        token: 'testToken',
        tokenExpires: Date.now() + ms('30m'),
        user: newSocialUser as User,
      });     
    });

    it('check return value at origin social user changed social id', async () => {
      jest.spyOn(userService, 'findOne').mockImplementation((fields) => {
        if ('socialId' in fields){
          return Promise.resolve(originUser);
        }
        else
          return Promise.resolve(null);
      });
      jest.spyOn(userService, 'update').mockResolvedValue(mockSocialUser);

      const res = await authService.validateSocialLogin('kakao', {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'newemail@naver.com'
      });
      
      expect(res).toEqual({
        refreshToken: 'testToken',
        token: 'testToken',
        tokenExpires: Date.now() + ms('30m'),
        user: mockSocialUser as User,
      });
    });

    it('check error at login user different from record provider', async () => {
      jest.spyOn(userService, 'findOne').mockImplementation((fields) => {
        if ('email' in fields)
          return Promise.resolve(newSocialUser);
        else
          return Promise.resolve(null);
      });
      const error422Email = new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            password: 'email already exists with a different provider.',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

      const res = await authService.validateSocialLogin('kakao', socialData)
        .catch(e => e);
      expect(res).toStrictEqual(error422Email);
    });
  });

  describe('confirmEmail', () => {
    let targetUser;
    const hash = 'hsahedstring';

    beforeEach(async () => {
      jest.clearAllMocks();
      targetUser = new MockInActiveUser();
      jest.spyOn(userService, 'findOne').mockImplementation(() => Promise.resolve(targetUser));
      jest.spyOn(userService, 'save').mockResolvedValue(targetUser);
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({ confirmEmailUserId: 1 });
    });

    it('should be defined', () => {
      expect(authService.confirmEmail).toBeDefined();
    });

    it('type check', () => {
      expect(typeof authService.confirmEmail).toBe('function');
    });

    it('check with parameter', async () => {
      await authService.confirmEmail(hash);
      expect(userService.findOne).toHaveBeenCalledWith({id: targetUser.id});
      expect(userService.save).toHaveBeenCalledWith(targetUser);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(hash, {
        secret: 'Secret',
      });
    });

    it('check return the correct value(undefined).', async () => {
      jest.spyOn(userService, 'findOne').mockImplementation(() => Promise.resolve(targetUser));

      const res = await authService.confirmEmail(hash);
      expect(res).toEqual(undefined);
    });

    it('check inverify hash Error', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockImplementation(() => {
          throw new Error('test_error'); 
      });
      const error422Hash = new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            hash: 'invalidHash',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
      
      const res = await authService.confirmEmail(hash)
      .catch((e) => e);
      
      expect(res).toStrictEqual(error422Hash);
    });

    it('check Error: active user data in jwt', async () => {
      const activeUser = new MockUser() as unknown as User;
      jest.spyOn(userService, 'findOne').mockResolvedValue(activeUser);
      const error422User = new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'notFound',
        },
        HttpStatus.NOT_FOUND,
      );
      
      const res = await authService.confirmEmail(hash)
      .catch((e) => e);
      
      expect(res).toStrictEqual(error422User);
    });
  });

  describe('forgotPassword', () => {
    const user = new MockUser() as unknown as User;
    const email = user.email as string;

    beforeEach(async () => {
      jest.clearAllMocks();
      jest.spyOn(userService, 'findOne').mockReturnValue(Promise.resolve(user));
      jest.spyOn(jwtService, 'signAsync').mockReturnValue(Promise.resolve('hash'));
      jest.spyOn(mailService, 'forgotPassword').mockReturnValue(Promise.resolve());
    });

    it('should be defined', () => {
      expect(authService.forgotPassword).toBeDefined();
    });

    it('type check', () => {
      expect(typeof authService.forgotPassword).toBe('function');
    });

    it('check with parameter', async () => {
      const payload = {
        forgotUserId: user.id,
      };
      const option =
      {
        secret: 'secret_for_forgot_pw',
        expiresIn: '30m'
      };
      await authService.forgotPassword(email);
      expect(userService.findOne).toHaveBeenCalledWith({email});
      expect(jwtService.signAsync).toHaveBeenCalledWith(payload, option);
      expect(mailService.forgotPassword).toHaveBeenCalledWith({
        to: email,
        data: {
          hash: 'hash'
        }
      });
    });

    it('check Error: email not exist', async () => {
      jest.spyOn(userService, 'findOne').mockResolvedValue(null);
      const error422Email = new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'emailNotExists',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
      
      const res = await authService.forgotPassword(email)
        .catch((e) => e);
      
      expect(res).toStrictEqual(error422Email);
    });

    it('check return the correct value.', async () => {
      const res = await authService.forgotPassword(email);
      expect(res).toEqual(undefined);
    });
  });

  describe('refreshToken', () => {
    const session = {
      id: 10,
      user: new MockUser() as unknown as User
    } as Session;
    const expiresIn = '30m';
    const payload = {
      id: session.user.id,
      role: session.user.role,
      sessionId: session.id,
    };
    const option =
    {
      secret: 'secret',
      expiresIn: expiresIn
    };
    const option2 =
    {
      secret: 'refresh_secret',
      expiresIn: expiresIn
    };

    beforeEach(async () => {
      jest.clearAllMocks();
      jest.spyOn(sessionService, 'findOne').mockReturnValue(Promise.resolve(session));
      jest.spyOn(jwtService, 'signAsync').mockReturnValue(Promise.resolve('hash'));
    });

    it('should be defined', () => {
      expect(authService.refreshToken).toBeDefined();
    });

    it('type check', () => {
      expect(typeof authService.refreshToken).toBe('function');
    });

    it('check with parameter', async () => {
      await authService.refreshToken({ sessionId: session.id });
      expect(sessionService.findOne).toHaveBeenCalledWith({
        where: {
          id: session.id,
        },
      });
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(1, payload, option);
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(2, {sessionId: payload.sessionId}, option2);
    });

    it('check Error: email not exist', async () => {
      jest.spyOn(sessionService, 'findOne').mockResolvedValue(null);
      const error422 = new UnauthorizedException();
      
      const res = await authService.refreshToken({ sessionId: session.id })
        .catch((e) => e);
      
      expect(res).toStrictEqual(error422);
    });

    it('check return the correct value.', async () => {
      const returnValue = {
        refreshToken: 'hash', 
        token: 'hash', 
        tokenExpires: Date.now() + ms('30m'),
      };

      const res = await authService.refreshToken({ sessionId: session.id });
      expect(res).toEqual(returnValue);
    });
  });

  describe('softDelete', () => {
    const user = new MockUser() as unknown as User;

    beforeEach(async () => {
      jest.clearAllMocks();
      jest.spyOn(userService, 'softDelete').mockReturnValue(Promise.resolve());
    });

    it('should be defined', () => {
      expect(authService.softDelete).toBeDefined();
    });

    it('type check', () => {
      expect(typeof authService.softDelete).toBe('function');
    });

    it('check with parameter', async () => {
      await authService.softDelete(user);
      expect(userService.softDelete).toHaveBeenCalledWith(user.id);
    });

    it('check return the correct value(undefined).', async () => {
      const res = await authService.softDelete(user);
      expect(res).toEqual(undefined);
    });
  });

  describe('resetPassword', () => {
    const user = new MockUser() as unknown as User;
    const parameter = { hash: 'hash', password: 'password'};
    const option =
    {
      secret: 'secret_for_forgot_pw',
    };
    beforeEach(async () => {
      jest.clearAllMocks();
      jest.spyOn(jwtService, 'verifyAsync').mockReturnValue(Promise.resolve({forgotUserId: user.id}));
      jest.spyOn(userService, 'findOne').mockReturnValue(Promise.resolve(user));
      jest.spyOn(sessionService, 'softDelete').mockReturnValue(Promise.resolve());
      jest.spyOn(userService, 'save').mockReturnValue(Promise.resolve(user));
    });

    it('should be defined', () => {
      expect(authService.resetPassword).toBeDefined();
    });

    it('type check', () => {
      expect(typeof authService.resetPassword).toBe('function');
    });

    it('check with parameter', async () => {
      await authService.resetPassword(parameter.hash, parameter.password);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(parameter.hash, option);
      expect(userService.findOne).toHaveBeenCalledWith({id: user.id});
      expect(sessionService.softDelete).toHaveBeenCalledWith({
        user: {
          id: user.id,
        }
      });
      expect(userService.save).toHaveBeenCalledWith(user);
    });

    it('check Error: userId not exist', async () => {
      jest.spyOn(userService, 'findOne').mockResolvedValue(null);
      const error422User = new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            hash: 'notFound',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
      
      const res = await authService.resetPassword(parameter.hash, parameter.password)
        .catch((e) => e);
      
      expect(res).toStrictEqual(error422User);
    });

    it('check Error: forgotpassword invalidHash', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockImplementation(() => {
        throw new Error('test_error'); 
    });
    const error422Hash = new HttpException(
      {
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          hash: 'invalidHash',
        },
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
      
      const res = await authService.resetPassword(parameter.hash, parameter.password)
        .catch((e) => e);
      
      expect(res).toStrictEqual(error422Hash);
    });

    it('check return the correct value.', async () => {
      const res = await authService.resetPassword(parameter.hash, parameter.password);
      expect(res).toEqual(undefined);
    });
  });

  describe('findMe', () => {
    const user = new MockUser() as unknown as User;
    const now = Date.now();
    const userJwtPayload = {
      id: user.id,
      role: user.role,
      sessionId: 10,
      iat: now - ms('30m'),
      exp: now + ms('30m'),
    };
    beforeEach(async () => {
      jest.clearAllMocks();
      jest.spyOn(userService, 'findOne').mockReturnValue(Promise.resolve(user));
    });

    it('should be defined', () => {
      expect(authService.findMe).toBeDefined();
    });

    it('type check', () => {
      expect(typeof authService.findMe).toBe('function');
    });

    it('check with parameter', async () => {
      await authService.findMe(userJwtPayload);
      expect(userService.findOne).toHaveBeenCalledWith({id: userJwtPayload.id});
    });

    it('check return the correct value(undefined).', async () => {
      const res = await authService.findMe(userJwtPayload);
      expect(res).toEqual(user);
    });
  });

  describe('update', () => {
    const user = new MockUser() as unknown as User;
    const now = Date.now();
    const userJwtPayload = {
      id: user.id,
      role: user.role,
      sessionId: 10,
      iat: now - ms('30m'),
      exp: now + ms('30m'),
    };
    const userDto = {
      photo: undefined,
      firstName: user.firstName,
      lastName: user.lastName,
      password: user.password,
      oldPassword: 'hashedpassword'
    } as AuthUpdateDto;

    beforeEach(async () => {
      jest.clearAllMocks();
      jest.spyOn(userService, 'findOne').mockReturnValue(Promise.resolve(user));
      jest.spyOn(sessionService, 'softDelete').mockReturnValue(Promise.resolve());
      jest.spyOn(userService, 'update').mockReturnValue(Promise.resolve(user));
      bcrypt.compare = jest.fn().mockResolvedValue(true);
    });

    it('should be defined', () => {
      expect(authService.update).toBeDefined();
    });

    it('type check', () => {
      expect(typeof authService.update).toBe('function');
    });

    it('check with parameter', async () => {
      await authService.update(userJwtPayload, userDto);
      expect(userService.findOne).toHaveBeenNthCalledWith(1, {id: userJwtPayload.id});
      expect(bcrypt.compare).toHaveBeenCalledWith(userDto.oldPassword, user.password);
      expect(sessionService.softDelete).toHaveBeenCalledWith({
        user: {
          id: user.id,
        },
        excludeId: userJwtPayload.sessionId,
      });
      expect(userService.update).toHaveBeenCalledWith(userJwtPayload.id, userDto);
      expect(userService.findOne).toHaveBeenNthCalledWith(2, {
        id: userJwtPayload.id,
      });
    });

    it('check Error: missingOldPassword', async () => {
      const errorUserDto = {...userDto, oldPassword: ''};
      jest.spyOn(userService, 'findOne').mockResolvedValue(null);
      const error422OldPw = new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            oldPassword: 'missingOldPassword',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
      
      const res = await authService.update(userJwtPayload, errorUserDto)
        .catch((e) => e);
      
      expect(res).toStrictEqual(error422OldPw);
    });

    it('check Error: userNotFound', async () => {
      jest.spyOn(userService, 'findOne').mockResolvedValue(null);
      const error422User = new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            user: 'userNotFound',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
      
      const res = await authService.update(userJwtPayload, userDto)
        .catch((e) => e);
      
      expect(res).toStrictEqual(error422User);
    });

    it('check Error: incorrectOldPassword', async () => {
      bcrypt.compare = jest.fn().mockResolvedValue(false);
      const error422Pw = new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            user: 'incorrectOldPassword',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
      
      const res = await authService.update(userJwtPayload, userDto)
        .catch((e) => e);
      
      expect(res).toStrictEqual(error422Pw);
    });

    it('check return the correct value(undefined).', async () => {
      const res = await authService.update(userJwtPayload, userDto);
      expect(res).toEqual(user);
    });
  });
});
