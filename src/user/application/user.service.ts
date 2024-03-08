import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '../domain/user.entity';
import { SignInUserDto } from './dto/signInUser.dto';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository, // User 엔티티의 Repository 주입
  ) {}

  /**user생성 메서드 */
  async create(createUserDto: CreateUserDto): Promise<User> {
    return await this.userRepository.save(
      this.userRepository.create(createUserDto),
    );
  }

  async getUser(): Promise<User[] | null>  {
    return await this.userRepository.findAllUser();
  }
}
