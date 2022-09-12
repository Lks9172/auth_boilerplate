import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateUserDto } from './dto/create-user.dto'
import { SignInUserDto } from './dto/SignIn-user.dto'
import { ChangePwUserDto } from './dto/changePw-user.dto'
import { Account } from './account.class'
import { User } from './user.entity'
import { UserRepository } from './user.repository'
import { tLoginRes } from './dto/types'


@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
      ) {}

    async createAccount(createUserDto: CreateUserDto): Promise<User> {
        const account = new Account()
        account.setSignUpinfo(createUserDto)
        account.setHashPw()
        const newUser = await this.userRepository.createUser(account)
        return newUser
    }

    async login(signInUserDto: SignInUserDto): Promise<tLoginRes> {
        const account = new Account()
        account.setSignInInfo(signInUserDto)
        const user = await this.userRepository.getUserById(account.userId)

        if (!account.comparePassword(user.password))
            throw new BadRequestException('password가 일치하지 않습니다.')
        if (!account.getJwt())
            throw new BadRequestException('token발급에 실패했습니다.')
        if (!account.getRefreshToken())
            throw new BadRequestException('refreshToken발급에 실패했습니다.')

        await this.userRepository.updateTokenById(user, account)

        return account.getResform()
    }
    
    async updatePassword(changePwUserDto: ChangePwUserDto): Promise<boolean> {
        const account = new Account()
        account.setSignInInfo(changePwUserDto)
        const user = await this.userRepository.getUserById(account.userId)

        if (!account.comparePassword(user.password))
            throw new BadRequestException('password가 일치하지 않습니다.')

        return await this.userRepository.updatePasswordById(user)
    }

    async deleteUser(changePwUserDto: ChangePwUserDto): Promise<boolean> {
        const account = new Account()
        account.setSignInInfo(changePwUserDto)
        const user = await this.userRepository.getUserById(account.userId)

        if (!account.comparePassword(user.password))
            throw new BadRequestException('password가 일치하지 않습니다.')

        return await this.userRepository.deleteById(user)
    }
}
