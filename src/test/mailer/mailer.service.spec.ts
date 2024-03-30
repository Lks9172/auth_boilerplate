import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import fs from 'node:fs/promises';
import Handlebars from 'handlebars';
import { MailerService } from '../../mailer/application/mailer.service';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn(),
  }),
}));

jest.mock('node:fs/promises', () => ({
  readFile: jest.fn(),
}));

jest.mock('handlebars');

describe('MailerService', () => {
  let mailerService: MailerService;
  let mockConfigService: Partial<ConfigService> & { get: jest.Mock };
  let transporter: {
    sendMail: jest.Mock;
  };

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn((key) => {
        switch (key) {
          case 'mail.host':
            return 'smtp.example.com';
          case 'mail.port':
            return 587;
          case 'mail.defaultEmail':
            return 'smtp.example.com';
          // 필요한 다른 설정 키에 대한 반환 값을 추가하세요.
          default:
            return null;
        }
      }),
    };
    transporter = nodemailer.createTransport();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailerService,
        {
          provide: ConfigService, 
          useValue: mockConfigService 
        },
      ],
    }).compile();

    mailerService = module.get<MailerService>(MailerService);
    (Handlebars.compile as jest.Mock).mockImplementation(() => jest.fn());
  });
  describe('sendMail', () => {
    const mailOptions = {
      to: 'test@example.com',
      subject: 'Test Email',
    };
    const templatePath = 'path/to/template';
    const context = { name: 'John Doe' };
    
    beforeEach(() => {
      // mockConfigService.get의 호출 횟수 리셋
      jest.spyOn(transporter, 'sendMail');
      mockConfigService.get.mockClear();
    });

    it('should be defined', () => {
      expect(mailerService).toBeDefined();
    });

    it('type check', () => {
      expect(typeof mailerService.sendMail).toBe('function');
    });

    it('check called time', async () => {
      await mailerService.sendMail({
        ...mailOptions,
        templatePath,
        context,
      });

      expect(fs.readFile).toBeCalledTimes(1);
      expect(Handlebars.compile).toBeCalledTimes(1);
      expect(transporter.sendMail).toBeCalledTimes(1);
      expect(mockConfigService.get).toBeCalledTimes(1);
    });

    it('check called with parameter', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue('Email content {{name}}');

      await mailerService.sendMail({
        ...mailOptions,
        templatePath,
        context,
      });

      expect(fs.readFile).toHaveBeenCalledWith(templatePath, 'utf-8');
      expect(Handlebars.compile).toHaveBeenCalledWith(
        'Email content {{name}}', 
        {
        strict: true,
        });
      expect(transporter.sendMail).toHaveBeenCalledWith({
        ...mailOptions,
        from: 'smtp.example.com',
        html: undefined,
      });
      expect(mockConfigService.get).toHaveBeenCalledWith(
        'mail.defaultEmail',
        { infer: true}
        );
    });

    it('check return the correct value', async () => {
      const response = await mailerService.sendMail({
        ...mailOptions,
        templatePath,
        context,
      });
      expect(response).toEqual(undefined);
    });
  });
});
