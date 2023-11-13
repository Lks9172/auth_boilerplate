import { UserRegister } from './register.client';
import { UserInfo } from '../../builder/user.builder';
import { Cipher } from '../auth/origin-auth.client';

export class OriginRegister implements UserRegister{
  user: UserInfo;
  cipher: Cipher;

  setUser(user: UserInfo): void {
      this.user = user;
      this.cipher = new Cipher(this.user.password);
  }

  async register(): Promise<boolean> {
      await this.cipher.setHashPw();
      this.user.password = this.cipher.hashedPw;

      return true;
  }
}