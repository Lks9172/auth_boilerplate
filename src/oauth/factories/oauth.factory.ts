import { Injectable } from '@nestjs/common';
import { OAuthInterface } from '../interface/oauth.interface';
import { OAuthGoogleService } from '../oauth-google.service';
import { AuthProvidersEnum } from '../../auth/domain/auth-providers.enum';

@Injectable()
export class OAuthFactory {
  private gateway: OAuthInterface;

  constructor(
    private readonly oAuthGoogleService: OAuthGoogleService,
  ) {}

  public getOAuthService(type: AuthProvidersEnum) {
    switch (type) {
      case AuthProvidersEnum.google:
        return this.oAuthGoogleService;
      default:
        throw new Error('Invalid service type: ' + type);
    }
  }
}
