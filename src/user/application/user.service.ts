import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from '../infrastructure/entities/user.entity';
import { UserRepository } from '../repository/user.repository';
import { EntityCondition } from '../../utils/types/entity-condition.type';
import { NullableType } from '../../utils/types/nullable.type';
import { DeepPartial } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository, // User 엔티티의 Repository 주입
  ) {}

  /**user생성 메서드 */
  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    return await this.userRepository.save(
      this.userRepository.create(createUserDto),
    );
  }

  async getUser(): Promise<UserEntity[] | null>  {
    return await this.userRepository.findAllUser();
  }

  findOne(fields: EntityCondition<UserEntity>): Promise<NullableType<UserEntity>> {
    return this.userRepository.findOne({
      where: fields,
    });
  }

  update(id: UserEntity['id'], payload: DeepPartial<UserEntity>): Promise<UserEntity> {
    return this.userRepository.save(
      this.userRepository.create({
        id,
        ...payload,
      }),
    );
  }

  async softDelete(id: UserEntity['id']): Promise<void> {
    await this.userRepository.softDelete(id);
  }

  async save(user: UserEntity): Promise<UserEntity> {
    return await this.userRepository.save(user);
  }
}
