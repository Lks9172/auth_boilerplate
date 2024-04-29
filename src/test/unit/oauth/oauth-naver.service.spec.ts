import { Test, TestingModule } from '@nestjs/testing';
import { OAuthNaverService } from '../../../oauth/application/oauth-naver.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('OAuthKakaoService', () => {
  let oAuthNaverService: OAuthNaverService;
  let httpService: HttpService;
  const mockData = {
    data: {
      response: {
        id: 'some-id',
        email: 'user@naver.com',
        name: 'John Doe',
      },
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthNaverService,
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
              if (key === 'naver.userInfoUrl') {
                return 'https://openapi.naver.com/v1/nid/me';
              }
            }),
          },
        },
      ],
    }).compile();

    oAuthNaverService = module.get<OAuthNaverService>(OAuthNaverService);
    httpService = module.get<HttpService>(HttpService);
  });

  describe('getProfileByToken', () => {  
    const loginDto = { social: 'naver', idToken: 'fake-id-token' };

    it('should be defined', () => {
      expect(oAuthNaverService.getProfileByToken).toBeDefined();
    });

    it('type check', () => {
      expect(typeof oAuthNaverService.getProfileByToken).toBe('function');
    });

    it('check called time', async () => {
      await oAuthNaverService.getProfileByToken(loginDto);

      expect(httpService.get).toHaveBeenCalledTimes(2);
    });

    it('check called with parameter', async () => {
      await oAuthNaverService.getProfileByToken(loginDto);

      expect(httpService.get).toHaveBeenNthCalledWith(1, 'https://openapi.naver.com/v1/nid/me', expect.any(Object));
      expect(httpService.get).toHaveBeenNthCalledWith(2, 'https://openapi.naver.com/v1/nid/me', expect.any(Object));
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

      const res = await oAuthNaverService.getProfileByToken(loginDto)
        .catch(e => e);
      expect(res).toStrictEqual(error422Token);
    });

    it('should call verifyToken and getPayload correctly', async () => {
      const profile = await oAuthNaverService.getProfileByToken(loginDto);

      expect(profile).toEqual({
        id: mockData.data.response.id,
        email: mockData.data.response.email,
        firstName: '',
        lastName: mockData.data.response.name,
      });
    });
  });
});
