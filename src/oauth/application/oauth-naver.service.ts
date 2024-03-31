import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SocialInterface } from '../../social/interfaces/social.interface';
import { OAuthInterface } from '../interface/oauth.interface';
import { OAuthLoginDto } from '../dto/oauth-login.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../../config/config.type';

@Injectable()
export class OAuthNaverService implements OAuthInterface{
  private userInfoUrl: string;
  private header = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      Authorization: '',
    },
  };

  constructor(
    private configService: ConfigService<AllConfigType>,
    private httpService: HttpService
    ) {
    this.userInfoUrl = configService.get('naver.userInfoUrl', { infer: true }) as string;  
  }

  async getProfileByToken(
    loginDto: OAuthLoginDto,
  ): Promise<SocialInterface> {
    this.setHeader(loginDto.idToken);
    const isValid = await this.verifyToken();
    if (!isValid) {
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
    return await this.getPayload();
  }

  async verifyToken(): Promise<boolean> {
    try {
      await firstValueFrom(
        this.httpService.get(this.userInfoUrl, this.header),
      );
    }
    catch {
      return false;
    }
    return true;
  }

  private async getPayload(): Promise<SocialInterface> {
    const data = await firstValueFrom(
      this.httpService.get(this.userInfoUrl, this.header),
    );

    return {
      id: data.data.response.id,
      email: data.data.response.email,
      firstName: '',
      lastName: data.data.response.name,
    };
  }

  private setHeader(accessToken: string): void{
    this.header = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        Authorization: `Bearer ${accessToken}`,
      },
    };
  }
}
