import { IsAlphanumeric, IsNotEmpty, Length } from 'class-validator'

export class ChangePwUserDto{
  @IsNotEmpty()
  @IsAlphanumeric()
  @Length(10, 15)
  userId: string

  @IsNotEmpty()
  @Length(8, 20)
  password: string

  @IsNotEmpty()
  @Length(8, 20)
  newPassword: string
}