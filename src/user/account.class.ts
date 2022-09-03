import { CreateUserDto } from "./dto/create-user.dto"
import { SignInUserDto } from "./dto/signIn-user.dto"
import { tLoginRes } from "./dto/types"
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'


export class Account {
    userId: string
    private password: string
    hashedPw: string
    role: string
    saltRounds = 10
    token: string

    setSignUpinfo(createUserDto: CreateUserDto){
        this.password = createUserDto.password
        this.role = createUserDto.role
        this.userId = createUserDto.userId
    }

    setHashPw(): boolean {
        const salt = bcrypt.genSaltSync(this.saltRounds)
        this.hashedPw = bcrypt.hashSync(this.password, salt)
        return true
    }

    setSignInInfo(signInUserDto: SignInUserDto){
        this.password = signInUserDto.password
        this.userId = signInUserDto.userId
    }

    comparePassword(DbPw: string): boolean {
        return bcrypt.compareSync(this.password, DbPw)
    }

    getJwt(): boolean {
        const token = jwt.sign(
            {
                type: 'JWT',
                id: this.userId,
            },
            process.env.SECRET_KEY,
            {
                expiresIn: '60m',
                issuer: 'admin',
            }
        )
        this.token = token
        return true
    }

    getResform(): tLoginRes{
        return {
            userId: this.userId,
            token: this.token
        }
    }
}
