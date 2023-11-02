import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/createUser.dto';
import { Account } from './account.class';
import { User } from '../domain/user.entity';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository
  ) {}

  /**user생성 메서드 */
  async createUser(userInfo: CreateUserDto): Promise<User> {
    const account = new Account(userInfo);
    await account.cipher.setHashPw();
    const newUser = await this.userRepository.createUser(account);
    
    return new User();
  }

  setUserInfo(userInfo: CreateUserDto): CreateUserDto {
    userInfo.password = userInfo.password || null;
    userInfo.birthdate = userInfo.birthdate || null;
    userInfo.birthdate = userInfo.birthdate === null ? null : new Date(userInfo.birthdate);
    userInfo.gender = userInfo.gender || null;
    return userInfo;
  }
}
