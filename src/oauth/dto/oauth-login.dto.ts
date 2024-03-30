import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNotIn } from 'class-validator';
import { AuthProvidersEnum } from '../../auth/domain/auth-providers.enum';

export class OAuthLoginDto {
  @ApiProperty({ example: 'google' })
  @IsNotEmpty()
  @IsEnum(AuthProvidersEnum)
  @IsNotIn(['email'])
  social: string;

  @ApiProperty({ example: 'abc' })
  @IsNotEmpty()
  idToken: string;
}
