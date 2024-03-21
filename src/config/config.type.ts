import { AppConfig } from './app-config.type';
import { DatabaseConfig } from '../database/config/database-config.type';
import { AuthConfig } from '../auth/config/auth-config.type';
import { FileConfig } from '../files/config/file-config.type';
import { MailConfig } from '../mail/config/mail-config.type';
import { GoogleConfig } from '../oauth/config/google/google-config.type';
import { KakaoConfig } from '../oauth/config/kakao/kakao-config.type';
import { NaverConfig } from '../oauth/config/naver/naver-config.type';

export type AllConfigType = {
  app: AppConfig;
  auth: AuthConfig;
  database: DatabaseConfig;
  file: FileConfig;
  mail: MailConfig;
  google: GoogleConfig;
  kakao: KakaoConfig;
  naver: NaverConfig;
};
