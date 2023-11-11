import { Injectable } from '@nestjs/common';
import { RuntimeException } from '@nestjs/core/errors/exceptions/runtime.exception';
import { KakaoRegister } from './kakao-register.client';
import { GoogleRegister } from './google-register.client';
import { NaverRegister } from './naver-register.client';
import { OriginRegister } from './origin-register.client';
import { SocialType } from 'src/user/domain/social-type.enum';
import { UserRegister } from './register.client';

@Injectable()
export class RegisterFactory {
  constructor(
    private readonly originRegister: OriginRegister,
    private readonly kakaoRegister: KakaoRegister,
    private readonly naverRegister: NaverRegister,
    private readonly googleRegister: GoogleRegister,
  ) {}
  getClient(socialType: string): UserRegister {
    if (socialType === SocialType.ORIGIN) {
      return this.originRegister;
    }
    if (socialType === SocialType.KAKAO) {
      return this.kakaoRegister;
    }
    if (socialType === SocialType.NAVER) {
      return this.naverRegister;
    }
    if (socialType === SocialType.GOOGLE) {
      return this.googleRegister;
    }
    throw new RuntimeException('정의되지 않은 SocialType');
  }
}
