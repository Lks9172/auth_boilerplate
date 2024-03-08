// import { BadRequestException } from '@nestjs/common';
// import * as jwt from 'jsonwebtoken';

// export class JsonWentoken {
//     email: string;
//     accessToken: string;
//     refreshToken: string;
//     private secretKey: string;
  
//     constructor(email: string) {
//       this.secretKey = process.env.SECRET_KEY;
//       this.email = email;
//     }
  
//     genJwt(type: string, expiresIn: string): string {
//       return jwt.sign(
//         {
//           type,
//           email: this.email,
//         },
//         this.secretKey,
//         {
//           expiresIn,
//           issuer: 'admin',
//         }
//       );
//     }
  
//     setAccessToken(): boolean {
//       try {
//         this.accessToken = this.genJwt('accessToken', process.env.EXPIRESIN);
//       } catch (e) {
//         throw new BadRequestException('accessToken발급에 실패했습니다.');
//       }
//       return true;
//     }
  
//     setRefreshToken(): boolean {
//       try {
//         this.refreshToken = this.genJwt('refreshToken', process.env.REFRESHEXPIRESIN);
//       } catch (e) {
//         throw new BadRequestException('refreshToken발급에 실패했습니다.');
//       }
//       return true;
//     }

//     decodeJwt(token: string): any {
//       try {
//         const decoded = jwt.verify(token, process.env.SECRET_KEY);
//         return decoded;
//       } catch (error) {
//         // 토큰이 유효하지 않은 경우
//         console.error('토큰 복호화 실패:', error.message);
//         return null;
//       }
//     }
//   }
