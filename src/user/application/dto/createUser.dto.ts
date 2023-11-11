import { IsEmail, IsString, Length, Validate, IsOptional, ValidatorConstraint, ValidatorConstraintInterface, IsISO8601 } from 'class-validator';

@ValidatorConstraint({ name: 'IsPassword' })
export class IsPassword implements ValidatorConstraintInterface {
  validate(pw: string | null ): boolean {
    if (pw === undefined || pw === null || (typeof pw === 'string' && pw.length >= 8)) {
      return true;
    }
    return false;
  }
}

@ValidatorConstraint({ name: 'IsBirthDay' })
export class IsBirthDay implements ValidatorConstraintInterface {
  validate(birthDay: string | null ): boolean {
    if (birthDay === undefined || birthDay === null || typeof birthDay === 'string') {
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
  @Validate(IsBirthDay, {
    message: 'birthday must be a string of at least 10 characters or null'
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

  socialType: string;
}
