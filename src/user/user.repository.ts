import { BadRequestException, NotFoundException } from '@nestjs/common'
import { EntityRepository, Repository } from 'typeorm'
import { Account } from './account.class'
import { User } from './user.entity'

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  /**한개의 user 생성 */
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

  /**id값으로 user찾고 반환 */
  async getUserById(userId: string): Promise<User> {
    const user = await this.findOne({userId: userId})

    if (!user)
      throw new NotFoundException(`Can't find User with id ${userId}`)

    return user
  }

  /**user의 password를 변경하는 함수 */
  async updatePasswordById(user: User, account: Account): Promise<boolean> {
      const res = await this.update(user, {password: account.hashedPw})
        .then(()=>true)
        .catch((e) => {
          console.log(e)
          return false
        })

      if (!res)
        throw new Error('password를 변경하는데 실패했습니다.')

      return res
  }

  /**user의 token을 업데이트하는 함수 */
  async updateTokenById(user: User, account: Account): Promise<boolean> {
    const res = await this.update(
      user, 
      {
        accessToken: account.accessToken,
        refreshToken: account.refreshToken
      })
      .then(()=>true)
      .catch((e) => {
        console.log(e)
        return false
      })

    if (!res)
      throw new Error('token정보를 업데이트하는데 실패했습니다.')

    return res
  }

  //**특정 유저데이터를 삭제하는 함수 */
  async deleteById(user: User): Promise<boolean> {
    const res = await this.delete(user)
      .then(()=>true)
      .catch((e) => {
        console.log(e)
        return false
      })

    if (!res)
      throw new Error('user를 삭제하는데 실패했습니다.')

    return res
  }
}
