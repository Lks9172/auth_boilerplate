import { SocialInterface } from '../../social/interfaces/social.interface';
import { OAuthLoginDto } from '../dto/oauth-login.dto';

export interface OAuthInterface
 {
    getProfileByToken(
        loginDto: OAuthLoginDto,
      ): Promise<SocialInterface>;
}
