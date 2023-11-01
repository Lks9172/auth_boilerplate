import { Transform, Type } from 'class-transformer';
import { IsEmail, IsString, IsOptional, IsDate, IsBoolean, Length, MinLength, IsDateString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(8, 20)
  userId: string;

  @IsString()
  @MinLength(8)
  @IsOptional()
  password: string;

  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  birthdate: Date;

  @IsBoolean()
  @IsOptional()
  gender: boolean;
}