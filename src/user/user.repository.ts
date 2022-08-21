import { NotFoundException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { Account } from './account.class';
import { User } from './user.entity'

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    async createUser(account: Account): Promise<User> {    
        const user = this.create({
          userId: account.userId,
          password: account.hashedPw,
          role: account.role,
        });

        if (!(await this.findOne({userId: account.userId}))){
            new Error('이미 존재하는 userId입니다.')
        }

        await this.save(user);
        return user;
    }
}
