import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { UserModule } from './user/user.module';
import databaseConfig from './database/config/database.config';
import authConfig from './auth/config/auth.config';
import mailConfig from './mail/config/mail.config';
import appConfig from './config/app.config';
import fileConfig from './files/config/file.config';
import { ConfigModule } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { MailerModule } from './mailer/mailer.module';
import googleConfig from './oauth/config/google/google.config';
import kakaoConfig from './oauth/config/kakao/kakao.config';
import naverConfig from './oauth/config/naver/naver.config';
import { FilesModule } from './files/files.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';
import { CommonModule } from './common/common.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        authConfig,
        appConfig,
        mailConfig,
        fileConfig,
        googleConfig,
        kakaoConfig,
        naverConfig,
      ],
      envFilePath: ['.env'],
    }),
    EventEmitterModule.forRoot({
      // 이벤트 에미터 설정
      wildcard: false, // 와일드카드 이벤트 비활성화
      delimiter: '.', // 이벤트 구분자
      maxListeners: 10, // 최대 리스너 수
      verboseMemoryLeak: false, // 메모리 누수 경고 비활성화
      ignoreErrors: false, // 에러 무시하지 않음
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    }),
    CommonModule,
    UserModule,
    FilesModule,
    AuthModule,
    MailModule,
    MailerModule,
    RolesModule,
    PermissionsModule
  ],
})
export class AppModule {}
