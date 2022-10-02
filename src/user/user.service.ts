import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateUserDto } from './dto/create-user.dto'
import { SignInUserDto } from './dto/SignIn-user.dto'
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

    /**user생성 함수 */
    async createAccount(createUserDto: CreateUserDto): Promise<User> {
        const account = new Account()
        account.setSignUpinfo(createUserDto)
        account.setHashPw()
        const newUser = await this.userRepository.createUser(account)
        return newUser
    }

    /**로그인 함수 */
    async login(signInUserDto: SignInUserDto): Promise<tLoginRes> {
        const account = new Account()
        const user = await this.userRepository.getUserById(signInUserDto.userId)

        account.setSignInInfo(signInUserDto)
        account.checkPassword(user.password)
        account.getJwt()
        account.getRefreshToken()

        await this.userRepository.updateTokenById(user, account)

        return account.getResform()
    }

    /**패스워드 변경 함수 */
    async updatePassword(user: User, changePwUserDto: SignInUserDto): Promise<boolean> {
        const accountInfo = new Account()
        accountInfo.setSignInInfo(changePwUserDto)
        accountInfo.checkPassword(user.password)

        const newAccount = new Account()
        newAccount.setSignUpinfo({
            userId: user.userId,
            password: changePwUserDto.newPassword,
            role: user.role,
        })
        newAccount.setHashPw()

        return await this.userRepository.updatePasswordById(user, newAccount)
    }

    /** 특정 user삭제 함수 */
    async deleteUser(user: User, deleteUserDto: SignInUserDto): Promise<boolean> {
        const account = new Account()
        account.setSignInInfo({
            userId: user.userId,
            password: deleteUserDto.password
        })
        account.checkPassword(user.password)
        
        return await this.userRepository.deleteById(user)
    }
}
