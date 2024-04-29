import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FilesService } from '../../../files/application/files.service';
import { FileRepository } from '../../../files/repository/files.repository';
import { FileEntity } from '../../../files/entities/file.entity';
import fileConfig from '../../../files/config/file.config';
import { Readable } from 'stream';

describe('AuthService', () => {
  let filesService: FilesService;
  let mockConfigService: Partial<ConfigService>;
  let mockFileRepository: Partial<FileRepository>;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn((key) => {
        if (key === 'app.apiPrefix') return 'api';
      }),
      getOrThrow: jest.fn((key) => {
        if (key === 'file.driver') return 'local';
      }),
    };
    mockFileRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports:[
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            fileConfig,
          ]
        })
      ],
      providers: [
        FilesService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: FileRepository,
          useValue: mockFileRepository,
        },
      ],
    }).compile();

    filesService = module.get<FilesService>(FilesService);
  });

  describe('uploadFile', () => {
    const mockFile: Express.Multer.File = {
      fieldname: '',
      originalname: 'testfile.png',
      encoding: '',
      mimetype: 'image/png',
      size: 1234,
      destination: '',
      filename: 'testfile.png',
      path: 'files/testfile.png',
      buffer: Buffer.from(''),
      stream: new Readable() // 여기에 스트림을 추가합니다.
    };
    const fileEntity = {
      id: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
      path: '/api/v1/files/testfile.png',
    } as unknown as FileEntity;

    beforeEach(async () => {
      jest.spyOn(mockFileRepository, 'create').mockReturnValue(fileEntity);
      jest.spyOn(mockFileRepository, 'save').mockResolvedValue(fileEntity);
    });

    it('should be defined', () => {
      expect(filesService.uploadFile).toBeDefined();
    });

    it('type check', () => {
      expect(typeof filesService.uploadFile).toBe('function');
    });

    it('check called time', async () => {
      await filesService.uploadFile(mockFile);

      expect(mockFileRepository.save).toBeCalledTimes(1);
      expect(mockFileRepository.create).toBeCalledTimes(1);
      expect(mockConfigService.get).toBeCalledTimes(1);
      expect(mockConfigService.getOrThrow).toBeCalledTimes(1);
    });

    it('check called with parameter', async () => {
      const expectedPath = `/api/v1/${mockFile.path}`;
      await filesService.uploadFile(mockFile);

      expect(mockFileRepository.create).toHaveBeenCalledWith({ path: expectedPath });
      expect(mockFileRepository.save).toHaveBeenCalledWith(fileEntity);
      expect(mockConfigService.get).toHaveBeenCalledWith('app.apiPrefix', { infer: true });
      expect(mockConfigService.getOrThrow).toHaveBeenCalledWith('file.driver', { infer: true });
    });

    it('check error: selectFile at File transfer error', async () => {
      const error422File = new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            file: 'selectFile',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

      const res = await filesService.uploadFile(undefined as unknown as Express.Multer.File)
        .catch(e => e);
      expect(res).toStrictEqual(error422File);
    });

    it('check return the correct value', async () => {
      const expectedPath = `/api/v1/${mockFile.path}`;
      const response = await filesService.uploadFile(mockFile);

      expect(response.path).toEqual(expectedPath);
    });
  });
});