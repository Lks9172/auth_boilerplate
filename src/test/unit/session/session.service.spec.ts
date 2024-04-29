import { Test, TestingModule } from '@nestjs/testing';
import { FindOneOptions, Not } from 'typeorm';
import { SessionService } from '../../../session/application/session.service';
import { SessionRepository } from '../../../session/repository/session.repository';
import { Session } from '../../../session/entities/session.entity';
import { User } from '../../../user/domain/user.entity';
import { MockUser } from '../../utils/mock-user';
import MockSession from '../../utils/mock-session';

describe('SessionService', () => {
  let sessionService: SessionService;
  let mockSessionRepository: Partial<SessionRepository>;

  beforeEach(async () => {
    mockSessionRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      softDelete: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: SessionRepository,
          useValue: mockSessionRepository,
        },
      ],
    }).compile();
    sessionService = module.get<SessionService>(SessionService);

    mockSessionRepository = module.get<SessionRepository>(SessionRepository);
  });

  describe('findOne', () => {
    const options = {
      where: {
        id: 1,
      },
    } as FindOneOptions<Session>;
    const mockSession = new MockSession() as unknown as Session;
    
    beforeEach(async () => {
      jest.spyOn(mockSessionRepository, 'findOne').mockReturnValue(Promise.resolve(mockSession));
    });

    it('should be defined', () => {
      expect(sessionService.findOne).toBeDefined();
    });

    it('type check', () => {
      expect(typeof sessionService.findOne).toBe('function');
    });


    it('check called time', async () => {
      await sessionService.findOne(options);

      expect(mockSessionRepository.findOne).toBeCalledTimes(1);
    });

    it('check called with parameter', async () => {
      await sessionService.findOne(options);

      expect(mockSessionRepository.findOne).toHaveBeenCalledWith({
        where: options.where
      });  
    });

    it('check return the correct value.', async () => {
      const res = await sessionService.findOne(options);
      expect(res).toEqual(mockSession);
    });
  });

  describe('create', () => {
    const mockSession = new MockSession() as unknown as Session;
    const mockUser = new MockUser() as unknown as User;
    const data = {
      user: mockUser
    };
    beforeEach(async () => {
      jest.spyOn(mockSessionRepository, 'create').mockReturnValue(mockSession);
      jest.spyOn(mockSessionRepository, 'save').mockReturnValue(Promise.resolve(mockSession));
    });

    it('should be defined', () => {
      expect(sessionService.create).toBeDefined();
    });

    it('type check', () => {
      expect(typeof sessionService.create).toBe('function');
    });


    it('check called time', async () => {
      await sessionService.create(data);

      expect(mockSessionRepository.create).toBeCalledTimes(1);
      expect(mockSessionRepository.save).toBeCalledTimes(1);
    });

    it('check called with parameter', async () => {
      await sessionService.create(data);

      expect(mockSessionRepository.create).toHaveBeenCalledWith(data);  
      expect(mockSessionRepository.save).toHaveBeenCalledWith(mockSession);  
    });

    it('check return the correct value.', async () => {
      const res = await sessionService.create(data);
      expect(res).toEqual(mockSession);
    });
  });

  describe('softDelete', () => {
    const mockUser = new MockUser() as unknown as User;
    const mockSession = new MockSession() as unknown as Session;
    const excludeId = mockSession.id;
    const criteria = {
      id: mockSession.id,
      user:{
        id: mockUser.id,
      },
    };
    const data  ={
      excludeId,
      ...criteria
    };
    const idCondition = criteria.id ? { id: criteria.id } : excludeId ? { id: Not(excludeId) } : {};

    beforeEach(async () => {
      jest.clearAllMocks();
    });

    it('should be defined', () => {
      expect(sessionService.softDelete).toBeDefined();
    });

    it('type check', () => {
      expect(typeof sessionService.softDelete).toBe('function');
    });

    it('check called time', async () => {
      await sessionService.softDelete(data);

      expect(mockSessionRepository.softDelete).toHaveBeenCalledTimes(1);
    });

    it('check with parameter', async () => {
      await sessionService.softDelete(data);
      expect(mockSessionRepository.softDelete).toHaveBeenCalledWith({
          ...criteria,
          ...idCondition
      });
    });

    it('check return the correct value(undefined).', async () => {
      const res = await sessionService.softDelete(data);
      expect(res).toEqual(undefined);
    });
  });
});