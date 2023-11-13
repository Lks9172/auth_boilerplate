
import { IsEmail, IsEnum, IsNotEmpty, Length } from 'class-validator';
import { SocialType } from 'src/user/domain/social-type.enum';

export class SignInUserDto {
  @IsEmail()
  @Length(10, 30)
  email: string;

  password?: string;

  token?: string;

  @IsNotEmpty()
  @IsEnum(SocialType)
  socialType: string;
}
