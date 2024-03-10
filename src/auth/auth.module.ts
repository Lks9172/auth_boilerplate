import { Module } from '@nestjs/common';
import { AuthController } from './presentation/auth.controller';
import { AuthService } from './application/auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { IsExist } from '../utils/validators/is-exists.validator';
import { IsNotExist } from '../utils/validators/is-not-exists.validator';
import { UserModule } from '../user/user.module';
import { MailService } from '../mail/application/mail.service';
import { MailerService } from '../mailer/application/mailer.service';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    IsExist,
    IsNotExist,
    AuthService,
    MailService,
    MailerService
  ],
  exports: [AuthService],
})
export class AuthModule {}
