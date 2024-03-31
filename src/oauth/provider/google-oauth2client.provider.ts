import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';

export const GoogleOAuth2ClientProvider = {
  provide: 'GOOGLE_OAUTH2_CLIENT',
  useFactory: (configService: ConfigService) => {
    return new OAuth2Client(
      configService.get('google.clientId'),
      configService.get('google.clientSecret')
    );
  },
  inject: [ConfigService],
};
