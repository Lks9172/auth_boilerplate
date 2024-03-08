// import { SocialType } from 'src/user/domain/social-type.enum';

// export class UserInfo {
//     userId: string;
//     password: string;
//     email: string;
//     name: string;
//     birthDate: Date;
//     gender: boolean;
//     token?: string;
//     socialType: string;

//     setUserId(userId: string) {
//         this.userId = userId;
//         return this;
//     }

//     setName(name: string) {
//         this.name = name;
//         return this;
//     }

//     setPw(password: string) {
//         this.password = password || null;
        
//         if (this.socialType == SocialType.ORIGIN)
//             this.password = null;
        
//             return this;
//     }
    
//     setEmail(email: string) {
//         this.email = email;
//         return this;
//     }
    
//     setBirthDate(birthDate: Date) {
//         this.birthDate = birthDate || null;
//         this.birthDate = this.birthDate === null ? null : new Date(this.birthDate);
//         return this;
//     }

//     setGender(gender: boolean) {
//         this.gender = typeof gender == 'boolean'? gender : null;
//         return this;
//     }

//     setToken(token: string) {
//         this.token = token || null;
//         return this;
//     }

//     setSocialType(socialType: string) {
//         this.socialType = socialType || null;
//         return this;
//     }
    
// }
