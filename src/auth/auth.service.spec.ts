import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { UserService } from '../user/application/user.service';
import { User } from '../user/domain/user.entity';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UserService,
        {
          provide: JwtService,
          useValue: {
              signAsync: jest.fn().mockResolvedValue('testToken'),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
              create: jest.fn().mockImplementation(dto => dto),
              save: jest.fn().mockImplementation(user => Promise.resolve(user)),
              findByEmail: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key) => {
              if (key === 'JWT_SECRET') return 'secretKey';
            }),
            getOrThrow: jest.fn().mockImplementation((key) => {
              if (key === 'auth.confirmEmailSecret') return 'secretKeyForEmailConfirmation';
              if (key === 'auth.confirmEmailExpires') return '1d'; // 예시로 '1d'를 반환합니다.
            }),
          },
        },
        {
          provide: UserService,
          useFactory: (userRepository) => {
              return new UserService(userRepository);
          },
          inject: [getRepositoryToken(User)],
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should register a new user and return a undefined', async () => {
    const authRegisterLoginDto: AuthRegisterLoginDto = {
      email: 'test@example.com',
      password: 'strongPassword',
      firstName: 'John',
      lastName: 'Doe',
    };

    const result = await authService.register(authRegisterLoginDto);
    expect(result).toEqual(undefined);
  });
});
