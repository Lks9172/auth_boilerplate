import { CreateUserDto } from "./dto/create-user.dto"
import { SignInUserDto } from "./dto/signIn-user.dto"
import { tLoginRes } from "./dto/types"
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { BadRequestException } from "@nestjs/common/exceptions"
import { exec } from "child_process"
import { execPath } from "process"


export class Account {
    userId: string
    private password: string
    hashedPw: string
    newPassword: string
    role: string
    saltRounds = parseInt(process.env.SALTROUNDS)
    accessToken: string
    refreshToken: string

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

    setSignInInfo(UserDto: SignInUserDto){
        this.password = UserDto.password
        this.userId = UserDto.userId
    }

    checkPassword(DbPw: string): boolean {
        if (bcrypt.compareSync(this.password, DbPw) === false)
            throw new BadRequestException('password가 일치하지 않습니다.')
        return true
    }

    genJwt(expiresIn: string): string {
        return jwt.sign(
            {
                type: 'JWT',
                id: this.userId,
            },
            process.env.SECRET_KEY,
            {
                expiresIn: expiresIn,
                issuer: 'admin',
            }
        )
    }

    getJwt(): boolean {
        try{
            this.accessToken = this.genJwt(process.env.EXPIRESIN)
        }
        catch(e){
            throw new BadRequestException('accessToken발급에 실패했습니다.')
        }
        return true
    }

    getRefreshToken(): boolean {
        try{
            this.refreshToken = this.genJwt(process.env.REFRESHEXPIRESIN)
        }
        catch(e){
            throw new BadRequestException('refreshToken발급에 실패했습니다.')
        }
        return true
    }

    getResform(): tLoginRes{
        return {
            userId: this.userId,
            token: this.accessToken,
            refreshToken: this.refreshToken
        }
    }
}
