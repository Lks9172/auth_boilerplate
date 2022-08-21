import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { Account } from './account.class';
import { User } from './user.entity'

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    async createUser(account: Account): Promise<User> {
        const checkUser = await this.findOne({
          userId: account.userId
        })
        if (checkUser){
          throw new BadRequestException('이미 존재하는 userId입니다.')
        }

        const user = this.create({
          userId: account.userId,
          password: account.hashedPw,
          role: account.role,
        });

        await this.save(user);
        return user;
    }

    async getUserById(userId: string): Promise<User> {
        const user = await this.findOne({userId: userId});
    
        if (!user) {
          throw new NotFoundException(`Can't find Order with id ${userId}`);
        }
    
        return user;
      }
}
