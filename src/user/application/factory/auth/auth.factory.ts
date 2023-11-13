import { Injectable } from '@nestjs/common';
import { RuntimeException } from '@nestjs/core/errors/exceptions/runtime.exception';
import { SocialType } from 'src/user/domain/social-type.enum';
import { AuthClient } from './auth.client';
import { OriginAuth } from './origin-auth.client';
import { KakaoAuth } from './kakao-auth.client';

@Injectable()
export class AuthFactory {
  constructor(
    private readonly originAuth: OriginAuth,
    private readonly kakaoAuth: KakaoAuth,
  ) {}
  getClient(socialType: string): AuthClient {
    if (socialType === SocialType.ORIGIN) {
      return this.originAuth;
    }
    else if (socialType === SocialType.KAKAO) {
      return this.kakaoAuth;
    }
    throw new RuntimeException('정의되지 않은 SocialType');
  }
}
