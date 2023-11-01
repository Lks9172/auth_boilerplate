import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { Account } from '../application/account.class';
import { User } from '../domain/user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  /**한개의 user 생성 */
  // async createUser(account: Account): Promise<User> {
  //   const checkUser = await this.findOne({
  //     userId: account.userId,
  //   });
  //   if (checkUser) throw new BadRequestException('이미 존재하는 userId입니다.');

  //   const user = this.create({
  //     userId: account.userId,
  //     password: account.cipher.hashedPw,
  //     role: account.role,
  //   });

  //   await this.save(user);
  //   return user;
  // }
}
