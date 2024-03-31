import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { SocialInterface } from '../../social/interfaces/social.interface';
import { AllConfigType } from 'src/config/config.type';
import { OAuthInterface } from '../interface/oauth.interface';
import { OAuthLoginDto } from '../dto/oauth-login.dto';

@Injectable()
export class OAuthGoogleService implements OAuthInterface{
  constructor(
    @Inject('GOOGLE_OAUTH2_CLIENT') private google: OAuth2Client,
    private configService: ConfigService<AllConfigType>,
    ) {}
    
  async getProfileByToken(
    loginDto: OAuthLoginDto,
  ): Promise<SocialInterface> {
    const ticket = await this.google.verifyIdToken({
      idToken: loginDto.idToken,
      audience: [
        this.configService.getOrThrow('google.clientId', { infer: true }),
      ],
    });

    const data = ticket.getPayload();

    if (!data) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            user: 'wrongToken',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return {
      id: data.sub,
      email: data.email,
      firstName: data.given_name,
      lastName: data.family_name,
    };
  }
}
