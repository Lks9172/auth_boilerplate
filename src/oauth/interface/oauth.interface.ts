import { SocialInterface } from '../../social/interfaces/social.interface';
import { OAuthGoogleLoginDto } from '../dto/oauth-google-login.dto';

export interface OAuthInterface
 {
    getProfileByToken(
        loginDto: OAuthGoogleLoginDto,
      ): Promise<SocialInterface>;
}
