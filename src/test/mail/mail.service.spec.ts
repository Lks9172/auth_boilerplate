import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from '../../mail/application/mail.service';
import appConfig from '../../config/app.config';
import { MailerService } from '../../mailer/application/mailer.service';
import path from 'path';

describe('AuthService', () => {
  let mailService: MailService;
  let mailerService: MailerService;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn((key) => {
        if (key === 'app.name') return 'api';
      }),
      getOrThrow: jest.fn((key) => {
        if (key === 'app.frontendDomain') return 'http://localhost:3000';
        if (key === 'app.workingDirectory') return '/';
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports:[
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            appConfig,
          ]
        })
      ],
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn()
          },
        },
      ],
    }).compile();

    mailService = module.get<MailService>(MailService);
    mailerService = module.get<MailerService>(MailerService);

  });

  describe('userSignUp', () => {
    const mailData = {
      to: 'test@example.com',
      data: {
        hash: 'testToken'
      }
    };
    const emailConfirmTitle = 'Confirm email';
    const text1 = 'Hey!';
    const text2 = 'You’re almost ready to start enjoying';
    const text3 = 'Simply click the big green button below to verify your email address.';
    const url = new URL(
      'http://localhost:3000'+ '/api/v1/auth/email/confirm',
    );
    url.searchParams.set('hash', mailData.data.hash);
    const mailerData = {
      to: mailData.to,
      subject: emailConfirmTitle,
      text: `${url.toString()} ${emailConfirmTitle}`,
      templatePath: path.join(
        '/',
        'src',
        'mail',
        'mail-templates',
        'activation.hbs',
      ),
      context: {
        title: emailConfirmTitle,
        url: url.toString(),
        actionTitle: emailConfirmTitle,
        app_name: 'api',
        text1,
        text2,
        text3,
      },
    };
    it('should be defined', () => {
      expect(mailService.userSignUp).toBeDefined();
    });

    it('type check', () => {
      expect(typeof mailService.userSignUp).toBe('function');
    });

    it('check called time', async () => {
      await mailService.userSignUp(mailData);

      expect(mailerService.sendMail).toBeCalledTimes(1);
      expect(mockConfigService.get).toBeCalledTimes(1);
      expect(mockConfigService.getOrThrow).toBeCalledTimes(2);
    });

    it('check called with parameter', async () => {
      await mailService.userSignUp(mailData);

      expect(mailerService.sendMail).toHaveBeenCalledWith(mailerData);
      expect(mockConfigService.get).toHaveBeenCalledWith('app.name', {
        infer: true,
      });
      expect(mockConfigService.getOrThrow).toHaveBeenNthCalledWith(1, 'app.frontendDomain', {
        infer: true,
      });
      expect(mockConfigService.getOrThrow).toHaveBeenNthCalledWith(2, 'app.workingDirectory', {
        infer: true,
      });
    });

    it('check return the correct value', async () => {
      const response = await mailService.userSignUp(mailData);

      expect(response).toEqual(undefined);
    });
  });
});