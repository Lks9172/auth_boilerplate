import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { OAuthKakaoService } from '../../../oauth/application/oauth-kakao.service';

describe('OAuthKakaoService', () => {
  let oAuthKakaoService: OAuthKakaoService;
  let httpService: HttpService;
  const mockData = {
    data: {
      id: 'some-id',
      kakao_account: { email: 'user@example.com' },
      properties: { nickname: 'John Doe' },
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthKakaoService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn().mockImplementation(() => {
              return of(mockData as AxiosResponse);
            }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'kakao.userInfoUrl') {
                return 'https://kakao.api/user/info';
              }
              if (key === 'kakao.verifyTokenUrl') {
                return 'https://kakao.api/token/verify';
              }
            }),
          },
        },
      ],
    }).compile();

    oAuthKakaoService = module.get<OAuthKakaoService>(OAuthKakaoService);
    httpService = module.get<HttpService>(HttpService);
  });


  describe('getProfileByToken', () => {  
    const loginDto = { social: 'kakao', idToken: 'fake-id-token' };

    it('should be defined', () => {
      expect(oAuthKakaoService.getProfileByToken).toBeDefined();
    });

    it('type check', () => {
      expect(typeof oAuthKakaoService.getProfileByToken).toBe('function');
    });

    it('check called time', async () => {
      await oAuthKakaoService.getProfileByToken(loginDto);

      expect(httpService.get).toHaveBeenCalledTimes(2);
    });

    it('check called with parameter', async () => {
      await oAuthKakaoService.getProfileByToken(loginDto);

      expect(httpService.get).toHaveBeenNthCalledWith(1, 'https://kakao.api/token/verify', expect.any(Object));
      expect(httpService.get).toHaveBeenNthCalledWith(2, 'https://kakao.api/user/info', expect.any(Object));
    });

    it('check error: token error', async () => {
      jest.spyOn(httpService, 'get').mockReturnValueOnce(
        throwError(() => new Error('Token verification failed'))
      );
    const error422Token = new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            user: 'wrongToken',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

      const res = await oAuthKakaoService.getProfileByToken(loginDto)
        .catch(e => e);
      expect(res).toStrictEqual(error422Token);
    });

    it('should call verifyToken and getPayload correctly', async () => {
      const profile = await oAuthKakaoService.getProfileByToken(loginDto);

      expect(profile).toEqual({
        id: mockData.data.id,
        email: mockData.data.kakao_account.email,
        firstName: '',
        lastName: mockData.data.properties.nickname,
      });
    });
  });
});
