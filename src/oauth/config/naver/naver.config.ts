import { registerAs } from '@nestjs/config';
import { IsOptional, IsString } from 'class-validator';
import validateConfig from '../../../utils/validate-config';
import { NaverConfig } from './naver-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  REQUEST_USER_INFO_URL: string;
}

export default registerAs<NaverConfig>('naver', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    userInfoUrl: process.env.NAVER_REQUEST_USER_INFO_URL
  };
});
