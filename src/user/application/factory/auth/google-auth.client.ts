// import { BadRequestException } from '@nestjs/common';
// import { AuthClient } from './auth.client';
// import { User } from 'src/user/domain/user.entity';
// import { JsonWentoken } from '../../jwt';
// import { SignInUserDto } from '../../dto/signInUser.dto';
// import { firstValueFrom } from 'rxjs';
// import { HttpService } from '@nestjs/axios';


// export class GoogleAuth implements AuthClient{
//     user: SignInUserDto;
//     private REQUEST_USER_INFO_URL = 'https://www.googleapis.com/oauth2/v1/userinfo';
//     private httpService= new HttpService();
//     jwt: JsonWentoken;

//     setUser (user: SignInUserDto) {
//         this.user = user;
//         this.jwt = new JsonWentoken(this.user.email);
//     }

//     async verifyUser(user: User): Promise<boolean> {
//         await this.getSocialInfo();

//         if (user.email !== this.user.email)
//             throw new BadRequestException('유효하지 않은 accessToken입니다.');
        
//         return true;
//     }

//     async getSocialInfo(): Promise<void> {
//         const header = {
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
//                 Authorization: `Bearer ${this.user.token}`,
//             },
//         };
    
//         const response = await firstValueFrom(
//             this.httpService.get(this.REQUEST_USER_INFO_URL, header),
//         );
    
//         this.user.email = response.data.email;
//     }

//     login(): boolean {
//         this.jwt.setAccessToken();
//         this.jwt.setRefreshToken();

//         return true;
//     }
// }