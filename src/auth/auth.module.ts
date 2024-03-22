import { Module } from '@nestjs/common';
import { AuthService } from './application/auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { IsExist } from '../utils/validators/is-exists.validator';
import { IsNotExist } from '../utils/validators/is-not-exists.validator';
import { UserModule } from '../user/user.module';
import { SessionModule } from 'src/session/session.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { MailModule } from '../mail/mail.module';
import { OAuthModule } from '../oauth/oauth.module';
import { AuthController } from './presentation/auth.controller';

@Module({
  imports: [
    UserModule,
    SessionModule,
    PassportModule,
    MailModule,
    OAuthModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    IsExist,
    IsNotExist,
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
