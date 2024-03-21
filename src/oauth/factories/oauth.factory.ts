import { Injectable } from '@nestjs/common';
import { OAuthGoogleService } from '../application/oauth-google.service';
import { AuthProvidersEnum } from '../../auth/domain/auth-providers.enum';
import { OAuthKakaoService } from '../application/oauth-kakao.service';
import { OAuthNaverService } from '../application/oauth-naver.service';

@Injectable()
export class OAuthFactory {
  constructor(
    private readonly oAuthGoogleService: OAuthGoogleService,
    private readonly oAuthKakaoService: OAuthKakaoService,
    private readonly oAuthNaverService: OAuthNaverService,
  ) {}

  public getOAuthService(type: AuthProvidersEnum) {
    switch (type) {
      case AuthProvidersEnum.google:
        return this.oAuthGoogleService;
      case AuthProvidersEnum.kakao:
        return this.oAuthKakaoService;
      case AuthProvidersEnum.naver:
        return this.oAuthNaverService;
      default:
        throw new Error('Invalid service type: ' + type);
    }
  }
}
