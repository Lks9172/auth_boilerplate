import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class OAuthGoogleLoginDto {
  @ApiProperty({ example: 'google' })
  @IsNotEmpty()
  social: string;

  @ApiProperty({ example: 'abc' })
  @IsNotEmpty()
  idToken: string;
}
