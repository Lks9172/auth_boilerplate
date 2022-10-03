import { tAccount, tLoginRes } from './dto/types';
import { BadRequestException } from '@nestjs/common/exceptions';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

export class Account {
  userId: string;
  password: string;
  role: string;
  cipher: Cipher;
  jwt: JsonWentoken;

  constructor(accountInfo: tAccount) {
    this.userId = accountInfo.userId;
    this.password = accountInfo.password;
    this.role = accountInfo.role;

    this.cipher = new Cipher(this.password);
    this.jwt = new JsonWentoken(this.userId);
  }

  getResform(): tLoginRes {
    return {
      userId: this.userId,
      token: this.jwt.accessToken,
      refreshToken: this.jwt.refreshToken,
    };
  }
}

export class JsonWentoken {
  userId: string;
  accessToken: string;
  refreshToken: string;
  private secretKey: string;

  constructor(userId: string) {
    this.secretKey = process.env.SECRET_KEY;
    this.userId = userId;
  }

  genJwt(expiresIn: string): string {
    return jwt.sign(
      {
        type: 'JWT',
        id: this.userId,
      },
      this.secretKey,
      {
        expiresIn: expiresIn,
        issuer: 'admin',
      }
    );
  }

  setAccessToken(): boolean {
    try {
      this.accessToken = this.genJwt(process.env.EXPIRESIN);
    } catch (e) {
      throw new BadRequestException('accessToken발급에 실패했습니다.');
    }
    return true;
  }

  setRefreshToken(): boolean {
    try {
      this.refreshToken = this.genJwt(process.env.REFRESHEXPIRESIN);
    } catch (e) {
      throw new BadRequestException('refreshToken발급에 실패했습니다.');
    }
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

  checkPassword(originalPw: string): boolean {
    if (bcrypt.compareSync(this.password, originalPw) === false)
      throw new BadRequestException('password가 일치하지 않습니다.');
    return true;
  }
}
