import { IsEmail, IsString, Length, Validate, IsOptional, ValidatorConstraint, ValidatorConstraintInterface, IsISO8601, IsNotEmpty, IsEnum } from 'class-validator';
import { SocialType } from 'src/user/domain/social-type.enum';

@ValidatorConstraint({ name: 'IsPassword' })
export class IsPassword implements ValidatorConstraintInterface {
  validate(pw: string | null ): boolean {
    if (pw === undefined || pw === null || (typeof pw === 'string' && pw.length >= 8)) {
      return true;
    }
    return false;
  }
}

@ValidatorConstraint({ name: 'IsBirthDate' })
export class IsBirthDate implements ValidatorConstraintInterface {
  validate(birthDate: string | null ): boolean {
    if (birthDate === undefined || birthDate === null || typeof birthDate === 'string') {
      return true;
    }
    return false;
  }
}

@ValidatorConstraint({ name: 'IsGender' })
export class IsGender implements ValidatorConstraintInterface {
  validate(gender: boolean | null ): boolean {
    console.log(gender);
    if (gender === undefined || gender === null || (typeof gender === 'boolean')) {
      return true;
    }
    return false;
  }
}

export class CreateUserDto {
  @IsString()
  @Length(8, 20)
  userId: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsISO8601()
  @Validate(IsBirthDate, {
    message: 'birthDate must be a string of at least 10 characters or null'
  })
  birthdate?: Date | null;

  @Validate(IsGender, {
    message: 'gender must be a string of at least 8 characters or null'
  })
  gender?: boolean | null;

  @Validate(IsPassword, {
    message: 'password must be a string of at least 8 characters or null'
  })
  password?: string | null;

  token?: string | null;

  @IsNotEmpty()
  @IsEnum(SocialType)
  socialType: string;
}
