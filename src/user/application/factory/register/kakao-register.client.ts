import { firstValueFrom } from 'rxjs';
import { UserRegister } from './register.client';
import { HttpService } from '@nestjs/axios';
import { UserInfo } from '../../builder/user.builder';

export class KakaoRegister implements UserRegister{
    user: UserInfo;
    private REQUEST_USER_INFO_URL = 'https://kapi.kakao.com/v2/user/me';
    private httpService= new HttpService();

    setUser(user: UserInfo): void {
        this.user = user;
    }

    async register(): Promise<boolean> {
        // 해당 토큰이 플랫폼에서 유효한지 확인
        await this.getSocialInfo();
        return true;
    }

    async getSocialInfo(): Promise<void> {
        const header = {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            Authorization: `Bearer ${this.user.token}`,
          },
        };
    
        const response = await firstValueFrom(
          this.httpService.get(this.REQUEST_USER_INFO_URL, header),
        );
    
        this.user.email = response.data.kakao_account.email;
       }
}