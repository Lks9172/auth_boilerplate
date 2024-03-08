import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './application/user.service';
import { UserController } from './presentation/user.controller';
import { User } from './domain/user.entity';
import { UserRepository } from './repository/user.repository';
import { TypeOrmExModule } from '../database/typeorm-ex.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: process.env.EXPIRESIN,
      },
    }),
    TypeOrmModule.forFeature([User]),
    TypeOrmExModule.forCustomRepository([UserRepository]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
  ],
  exports: [UserService],
})

export class UserModule {}
