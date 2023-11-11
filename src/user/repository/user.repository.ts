import { BadRequestException } from '@nestjs/common';
import { EntityRepository, Repository, EntityManager } from 'typeorm';
import { User } from '../domain/user.entity';
import { UserInfo } from '../application/builder/user.builder';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  /**한개의 user 생성 */
  async createUser(accountInfo: UserInfo): Promise<User> {
    const { userId, password, email, name, birthDate, gender } = accountInfo;

    const entityManager: EntityManager = this.manager;
    const checkUser = await this.findOne({
      userId,
    });

    if (checkUser) {
      throw new BadRequestException('이미 존재하는 userId입니다.');
    }

    return entityManager.transaction(async transactionalEntityManager => {
      const userRepository = transactionalEntityManager.getRepository(User);
      const user = userRepository.create({
        userId,
        password,
        email,
        name,
        birthDate,
        gender,
      });

      await userRepository.save(user);

      return user;
    });
  }
}
