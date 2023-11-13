import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './application/user.service';
import { UserController } from './presentation/user.controller';
import { UserRepository } from './repository/user.repository';
import { RegisterFactory } from './application/factory/register/register.factory';
import { OriginRegister } from './application/factory/register/origin-register.client';
import { NaverRegister } from './application/factory/register/naver-register.client';
import { KakaoRegister } from './application/factory/register/kakao-register.client';
import { GoogleRegister } from './application/factory/register/google-register.client';
import { AuthFactory } from './application/factory/auth/auth.factory';
import { OriginAuth } from './application/factory/auth/origin-auth.client';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: process.env.EXPIRESIN,
      },
    }),
    TypeOrmModule.forFeature([UserRepository]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    RegisterFactory,
    OriginRegister,
    NaverRegister,
    KakaoRegister,
    GoogleRegister,
    AuthFactory,
    OriginAuth
  ]
})
export class UserModule {}
