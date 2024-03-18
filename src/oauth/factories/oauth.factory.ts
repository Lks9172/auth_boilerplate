import { Injectable } from '@nestjs/common';
import { OAuthInterface } from '../interface/oauth.interface';
import { OAuthGoogleService } from '../application/oauth-google.service';
import { AuthProvidersEnum } from '../../auth/domain/auth-providers.enum';
import { OAuthKakaoService } from '../application/oauth-kakao.service';

@Injectable()
export class OAuthFactory {
  private gateway: OAuthInterface;

  constructor(
    private readonly oAuthGoogleService: OAuthGoogleService,
    private readonly oAuthKakaoService: OAuthKakaoService,
  ) {}

  public getOAuthService(type: AuthProvidersEnum) {
    switch (type) {
      case AuthProvidersEnum.google:
        return this.oAuthGoogleService;
      case AuthProvidersEnum.kakao:
        return this.oAuthKakaoService;
      default:
        throw new Error('Invalid service type: ' + type);
    }
  }
}
