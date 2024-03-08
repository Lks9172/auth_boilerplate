// import { Injectable } from '@nestjs/common';
// import { RuntimeException } from '@nestjs/core/errors/exceptions/runtime.exception';
// import { SocialType } from 'src/user/domain/social-type.enum';
// import { AuthClient } from './auth.client';
// import { OriginAuth } from './origin-auth.client';
// import { KakaoAuth } from './kakao-auth.client';
// import { NaverAuth } from './naver-auth.client';
// import { GoogleAuth } from './google-auth.client';

// @Injectable()
// export class AuthFactory {
//   constructor(
//     private readonly originAuth: OriginAuth,
//     private readonly kakaoAuth: KakaoAuth,
//     private readonly naverAuth: NaverAuth,
//     private readonly googleAuth: GoogleAuth,
//   ) {}
//   getClient(socialType: string): AuthClient {
//     if (socialType === SocialType.ORIGIN) {
//       return this.originAuth;
//     }
//     else if (socialType === SocialType.KAKAO) {
//       return this.kakaoAuth;
//     }
//     else if (socialType === SocialType.NAVER) {
//       return this.naverAuth;
//     }
//     else if (socialType === SocialType.GOOGLE) {
//       return this.googleAuth;
//     }
//     else
//       throw new RuntimeException('정의되지 않은 SocialType');
//   }
// }
