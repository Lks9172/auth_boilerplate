import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/createUser.dto';
import { User } from '../domain/user.entity';
import { RegisterFactory } from './factory/register/register.factory';
import { UserInfo } from './builder/user.builder';
import { SignInUserDto } from './dto/signInUser.dto';
import { AuthFactory } from './factory/auth/auth.factory';
import { AuthClient } from './factory/auth/auth.client';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository, // User 엔티티의 Repository 주입
    private readonly registerFactory: RegisterFactory,
    private readonly authFactory: AuthFactory
  ) {}

  /**user생성 메서드 */
  async createUser(socialType: string, userInfo: UserInfo): Promise<User> {
    const register = this.registerFactory.getClient(socialType);
    register.setUser(userInfo);
    await register.register();
    const newUser = await this.userRepository.createUser(register.user);
    
    return newUser;
  }

  async signIn(user: SignInUserDto): Promise<AuthClient> {
    const auth = this.authFactory.getClient(user.socialType);
    auth.setUser(user);
    
    const checkUser = await this.userRepository.findByEmail(user.email);
    if (!checkUser)
      throw new BadRequestException('가입이력이 없는 email입니다.');


    await auth.verifyUser(checkUser);
    auth.login();

    return auth;
  }

  normalizeUser(userInfo: CreateUserDto): UserInfo {
    const uInfo = new UserInfo()
    .setUserId(userInfo.userId)
    .setName(userInfo.name)
    .setPw(userInfo.password)
    .setEmail(userInfo.email)
    .setBirthDate(userInfo.birthdate)
    .setGender(userInfo.gender)
    .setToken(userInfo.token)
    .setSocialType(userInfo.socialType);
    
    return uInfo;
  }

  async getUser(): Promise<any> {
    const a = 1;
    const res = await this.userRepository.findAllUser();
    const q = 1;
    return null;
  }
}
