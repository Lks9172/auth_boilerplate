import { Module } from '@nestjs/common';
import { OAuthFactory } from './factories/oauth.factory';
import { OAuthGoogleService } from './application/oauth-google.service';
import { OAuthKakaoService } from './application/oauth-kakao.service';
import { OAuthNaverService } from './application/oauth-naver.service';


@Module({
  imports: [
  ],
  controllers: [],
  providers: [
    OAuthFactory,
    OAuthGoogleService,
    OAuthKakaoService,
    OAuthNaverService,
  ],
  exports: [OAuthFactory],
})
export class OAuthModule {}
