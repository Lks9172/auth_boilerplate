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
  async createAccount(createUserDto: CreateUserDto): Promise<string> {
    const account = new Account(createUserDto);
    await account.cipher.setHashPw();
    // const newUser = await this.userRepository.createUser(account);
    return 'hello world!!!';
  }
}
