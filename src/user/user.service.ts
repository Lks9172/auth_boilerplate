import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInUserDto } from './dto/SignIn-user.dto';
import { Account } from './account.class';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { tLoginRes } from './dto/types';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository
  ) {}

  /**user생성 메서드 */
  async createAccount(createUserDto: CreateUserDto): Promise<User> {
    const account = new Account(createUserDto);
    account.cipher.setHashPw();
    const newUser = await this.userRepository.createUser(account);
    return newUser;
  }

  /**로그인 메서드 */
  async login(signInUserDto: SignInUserDto): Promise<tLoginRes> {
    const user = await this.userRepository.getUserById(signInUserDto.userId);

    const account = new Account(signInUserDto);
    account.cipher.checkPassword(user.password);
    account.jwt.setAccessToken();
    account.jwt.setRefreshToken();

    await this.userRepository.updateTokenById(user, account);

    return account.getResform();
  }

  /**패스워드 변경 메서드 */
  async updatePassword(
    user: User,
    changePwUserDto: SignInUserDto
  ): Promise<boolean> {
    const accountInfo = new Account(changePwUserDto);
    accountInfo.cipher.checkPassword(user.password);

    const newAccount = new Account({
      userId: user.userId,
      password: changePwUserDto.newPassword,
      role: user.role,
    });
    newAccount.cipher.setHashPw();

    return await this.userRepository.updatePasswordById(user, newAccount);
  }

  /** 특정 user삭제 메서드 */
  async deleteUser(user: User, deleteUserDto: SignInUserDto): Promise<boolean> {
    const account = new Account({
      userId: user.userId,
      password: deleteUserDto.password,
    });
    account.cipher.checkPassword(user.password);

    return await this.userRepository.deleteById(user);
  }
}
