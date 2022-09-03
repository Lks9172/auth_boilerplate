import { BadRequestException, NotFoundException } from '@nestjs/common'
import { EntityRepository, Repository } from 'typeorm'
import { Account } from './account.class'
import { User } from './user.entity'

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    async createUser(account: Account): Promise<User> {
        const checkUser = await this.findOne({
          userId: account.userId
        })
        if (checkUser)
          throw new BadRequestException('이미 존재하는 userId입니다.')

        const user = this.create({
          userId: account.userId,
          password: account.hashedPw,
          role: account.role,
        })

        await this.save(user)
        return user
    }

    async getUserById(userId: string): Promise<User> {
        const user = await this.findOne({userId: userId})
    
        if (!user)
          throw new NotFoundException(`Can't find User with id ${userId}`)
    
        return user
    }

    async updatePasswordById(user: User): Promise<boolean> {
        const res = await this.update(user, {password: user.password})
          .then(()=>true)
          .catch((e) => {
            console.log(e)
            return false
          })

        if (!res)
          throw new Error('password를 변경하는데 실패했습니다.')

        return res
    }
}
