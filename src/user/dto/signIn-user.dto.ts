import { IsAlphanumeric, IsNotEmpty, Length } from 'class-validator'

export class SignInUserDto {
  @IsAlphanumeric()
  @Length(10, 15)
  userId: string

  @IsNotEmpty()
  password: string

  newPassword?: string
}