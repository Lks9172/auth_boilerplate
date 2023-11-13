import { BadRequestException } from '@nestjs/common';
import { AuthClient } from './auth.client';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/domain/user.entity';
import { JsonWentoken } from '../../jwt';
import { SignInUserDto } from '../../dto/signInUser.dto';


export class OriginAuth implements AuthClient{
    user: SignInUserDto;
    private cipher: Cipher;
    jwt: JsonWentoken;

    setUser (user: SignInUserDto) {
        this.user = user;
        this.cipher = new Cipher(this.user.password);
        this.jwt = new JsonWentoken(this.user.email);
    }

    async verifyUser(user: User): Promise<boolean> {
        return this.cipher.checkPassword(user);
    }

    async login(): Promise<boolean> {
        this.jwt.setAccessToken();
        this.jwt.setRefreshToken();

        return true;
    }
}

export class Cipher {
    saltRounds = parseInt(process.env.SALTROUNDS);
    password: string;
    hashedPw: string;
  
    constructor(password: string) {
      this.password = password;
    }
  
    async setHashPw(): Promise<boolean> {
      const salt = await bcrypt.genSalt(this.saltRounds);
      this.hashedPw = await bcrypt.hash(this.password, salt);
      return true;
    }
  
    checkPassword(user: User): boolean {
      if (bcrypt.compareSync(this.password, user.password) === false)
        throw new BadRequestException('password가 일치하지 않습니다.');
      return true;
    }
}
