import { registerAs } from '@nestjs/config';
import { IsOptional, IsString } from 'class-validator';
import validateConfig from '../../../utils/validate-config';
import { KakaoConfig } from './kakao-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  REQUEST_USER_INFO_URL: string;

  @IsString()
  @IsOptional()
  REQUEST_VERIFY_TOKEN_URL: string;
}

export default registerAs<KakaoConfig>('kakao', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    userInfoUrl: process.env.KAKAO_REQUEST_USER_INFO_URL,
    verifyTokenUrl: process.env.KAKAO_REQUEST_VERIFY_TOKEN_URL,
  };
});
