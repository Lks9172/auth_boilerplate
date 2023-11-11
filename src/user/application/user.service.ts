import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/createUser.dto';
import { User } from '../domain/user.entity';
import { UserRepository } from '../repository/user.repository';
import { RegisterFactory } from './factory/register/register.factory';
import { UserInfo } from './builder/user.builder';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private readonly registerFactory: RegisterFactory
  ) {}

  /**user생성 메서드 */
  async createUser(socialType: string, userInfo: UserInfo): Promise<User> {
    const register = this.registerFactory.getClient(socialType);
    register.setUser(userInfo);
    await register.register();
    const newUser = await this.userRepository.createUser(register.user);
    
    return newUser;
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
}
