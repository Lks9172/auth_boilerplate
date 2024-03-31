import { Module } from '@nestjs/common';
import { OAuthFactory } from './factories/oauth.factory';
import { OAuthGoogleService } from './application/oauth-google.service';
import { OAuthKakaoService } from './application/oauth-kakao.service';
import { OAuthNaverService } from './application/oauth-naver.service';
import { GoogleOAuth2ClientProvider } from './provider/google-oauth2client.provider';
import { HttpModule } from '@nestjs/axios'; // HttpModule 임포트



@Module({
  imports: [
    HttpModule
  ],
  controllers: [],
  providers: [
    OAuthFactory,
    OAuthGoogleService,
    OAuthKakaoService,
    OAuthNaverService,
    GoogleOAuth2ClientProvider,
  ],
  exports: [OAuthFactory],
})
export class OAuthModule {}
