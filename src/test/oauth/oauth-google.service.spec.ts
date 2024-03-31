import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OAuthGoogleService } from '../../oauth/application/oauth-google.service';
import { OAuth2Client } from 'google-auth-library';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('OAuthGoogleService', () => {
  let oAuthGoogleService: OAuthGoogleService;
  let mockConfigService: Partial<ConfigService>;
  let mockGoogleOAuth2Client: Partial<OAuth2Client>;
  let mockGetPayload: jest.Mock; // mockGetPayload 정의

  beforeEach(async () => {
    mockGetPayload = jest.fn().mockReturnValue({
      sub: '1234567890',
      email: 'test@example.com',
      given_name: 'John',
      family_name: 'Doe',
    });
    const mockVerifyIdToken = jest.fn().mockResolvedValue({
      getPayload: mockGetPayload,
    });
    mockGoogleOAuth2Client = {
      verifyIdToken: mockVerifyIdToken,
    };

    mockConfigService = {
      get: jest.fn(),
      getOrThrow: jest.fn().mockReturnValue('some-value'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthGoogleService,
        {
          provide: 'GOOGLE_OAUTH2_CLIENT',
          useValue: mockGoogleOAuth2Client,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    oAuthGoogleService = module.get<OAuthGoogleService>(OAuthGoogleService);
  });

    describe('getProfileByToken', () => {  
      const loginDto = { social: 'google', idToken: 'fake-id-token' };
      const corretReturnValue = {
        id: '1234567890',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

    it('should be defined', () => {
      expect(oAuthGoogleService.getProfileByToken).toBeDefined();
    });

    it('type check', () => {
      expect(typeof oAuthGoogleService.getProfileByToken).toBe('function');
    });


    it('check called time', async () => {
      await oAuthGoogleService.getProfileByToken(loginDto);


      expect(mockGoogleOAuth2Client.verifyIdToken).toHaveBeenCalledTimes(1);
      expect(mockGetPayload).toHaveBeenCalledTimes(1);
      expect(mockConfigService.getOrThrow).toHaveBeenCalledTimes(1);
    });

    it('check called with parameter', async () => {
      await oAuthGoogleService.getProfileByToken(loginDto);

      expect(mockGoogleOAuth2Client.verifyIdToken).toHaveBeenCalledWith({
        idToken: loginDto.idToken,
        audience: ['some-value'],
      });
      expect(mockGetPayload).toHaveBeenCalledWith();
      expect(mockConfigService.getOrThrow).toHaveBeenCalledWith('google.clientId', { infer: true });
    });


    it('check error: selectFile at File transfer error', async () => {
      mockGetPayload.mockReturnValueOnce(undefined);
      const error422Token = new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            user: 'wrongToken',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

      const res = await oAuthGoogleService.getProfileByToken(loginDto)
        .catch(e => e);
      expect(res).toStrictEqual(error422Token);
    });

    it('check return the correct value', async () => {
      const res = await oAuthGoogleService.getProfileByToken(loginDto);
      expect(res).toEqual(corretReturnValue);
    });
  });
});
