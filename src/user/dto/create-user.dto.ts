import { IsAlphanumeric, IsNotEmpty, Length } from 'class-validator'

export class CreateUserDto {
  @IsNotEmpty()
  @IsAlphanumeric()
  @Length(10, 15)
  userId: string

  @IsNotEmpty()
  password: string

  @IsNotEmpty()
  role: string
}
