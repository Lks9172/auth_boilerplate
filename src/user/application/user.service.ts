import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '../domain/user.entity';
import { UserRepository } from '../repository/user.repository';
import { EntityCondition } from '../../utils/types/entity-condition.type';
import { NullableType } from '../../utils/types/nullable.type';

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

  findOne(fields: EntityCondition<User>): Promise<NullableType<User>> {
    return this.userRepository.findOne({
      where: fields,
    });
  }
}
