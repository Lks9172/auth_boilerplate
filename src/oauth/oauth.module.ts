import { Module } from '@nestjs/common';
import { OAuthFactory } from './factories/oauth.factory';
import { OAuthGoogleService } from './application/oauth-google.service';


@Module({
  imports: [
  ],
  controllers: [],
  providers: [
    OAuthFactory,
    OAuthGoogleService
  ],
  exports: [OAuthFactory],
})
export class OAuthModule {}
