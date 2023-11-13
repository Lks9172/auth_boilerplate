import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

export class KakaoTokenGenerator {
    private REQUEST_TOKEN_URL = 'https://kauth.kakao.com/oauth/token';

    private client_id =  process.env.KAKAO_APP_KEY;
    private redirect_uri= process.env.KAKAO_REDIRECT_URL;
    private httpService= new HttpService();
    code: string;

    constructor(code: string) {
        this.code = code;
    }

    async verifyOauthMember(): Promise<string> {
        const reqInfo = {
            url: this.REQUEST_TOKEN_URL,
            header: {
              headers: {
                'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
              },
            },
            body: {
              grant_type: 'authorization_code',
              client_id: this.client_id,
              redirect_uri: this.redirect_uri,
              code: this.code
            }
          };
          
        const response = await firstValueFrom(
            this.httpService.post(reqInfo.url, reqInfo.body, reqInfo.header),
        );

        return response.data.access_token;
    }
}

export class NaverTokenGenerator {
    private REQUEST_TOKEN_URL = 'https://nid.naver.com/oauth2.0/token';

    private client_id =  process.env.NAVER_APP_KEY;
    private redirect_uri= process.env.NAVER_REDIRECT_URL;
    private client_secret= process.env.NAVER_SECRET;
    private httpService= new HttpService();
    code: string;

    constructor(code: string) {
        this.code = code;
    }

    async verifyOauthMember(): Promise<string> {
        const reqInfo = {
            url: this.REQUEST_TOKEN_URL,
            header: {
              headers: {
                'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
              },
            },
            body: {
              grant_type: 'authorization_code',
              client_id: this.client_id,
              redirect_uri: this.redirect_uri,
              code: this.code,
              client_secret: this.client_secret,
              state: 'test'
            }
          };
          
        const response = await firstValueFrom(
            this.httpService.post(reqInfo.url, reqInfo.body, reqInfo.header),
        );

        return response.data.access_token;
    }
}

export class GoogleTokenGenerator {
    private REQUEST_TOKEN_URL = 'https://oauth2.googleapis.com/token';

    private client_id =  process.env.GOOGLE_APP_KEY;
    private redirect_uri= process.env.GOOGLE_REDIRECT_URL;
    private client_secret= process.env.GOOGLE_SECRET;
    private httpService= new HttpService();
    code: string;

    constructor(code: string) {
        this.code = code;
    }

    async verifyOauthMember(): Promise<string> {
        const reqInfo = {
            url: this.REQUEST_TOKEN_URL,
            header: {
              headers: {
                'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
              },
            },
            body: {
              grant_type: 'authorization_code',
              client_id: this.client_id,
              redirect_uri: this.redirect_uri,
              code: this.code,
              client_secret: this.client_secret,
            }
          };
          
        const response = await firstValueFrom(
            this.httpService.post(reqInfo.url, reqInfo.body, reqInfo.header),
        );

        return response.data.access_token;
    }
}
