import { UserRegister } from './register.client';
import { Cipher } from '../../account.class';
import { UserInfo } from '../../builder/user.builder';

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