import { Test, TestingModule } from '@nestjs/testing';
import { MockUser } from '../utils/mock-user';
import { User } from 'src/user/domain/user.entity';
import { UserRepository } from '../../user/repository/user.repository';
import { UserService } from '../../user/application/user.service';
import { CreateUserDto } from '../../user/application/dto/create-user.dto';
import { DeepPartial } from 'typeorm';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: Partial<UserRepository>;

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      findAllUser: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      softDelete: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    mockUserRepository = module.get<UserRepository>(UserRepository);
  });

  describe('create', () => {
    const mockUser = new MockUser() as unknown as User;

    beforeEach(async () => {
      jest.spyOn(mockUserRepository, 'create').mockReturnValue(mockUser);
      jest.spyOn(mockUserRepository, 'save').mockReturnValue(Promise.resolve(mockUser));
    });

    it('should be defined', () => {
      expect(userService.create).toBeDefined();
    });

    it('type check', () => {
      expect(typeof userService.create).toBe('function');
    });

    it('check called time', async () => {
      await userService.create(mockUser);

      expect(mockUserRepository.create).toBeCalledTimes(1);
      expect(mockUserRepository.save).toBeCalledTimes(1);
    });

    it('check called with parameter', async () => {
      await userService.create(mockUser);

      expect(mockUserRepository.create).toHaveBeenCalledWith(mockUser as CreateUserDto);  
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);  
    });

    it('check return the correct value.', async () => {
      const res = await userService.create(mockUser);
      expect(res).toEqual(mockUser);
    });
  });

  describe('getUser', () => {
    const mockUser = new MockUser() as unknown as User;
    const userArray = [mockUser];

    beforeEach(async () => {
      jest.spyOn(mockUserRepository, 'findAllUser').mockResolvedValue(Promise.resolve(userArray as User[]));
    });

    it('should be defined', () => {
      expect(userService.getUser).toBeDefined();
    });

    it('type check', () => {
      expect(typeof userService.getUser).toBe('function');
    });

    it('check called time', async () => {
      await userService.getUser();

      expect(mockUserRepository.findAllUser).toBeCalledTimes(1);
    });

    it('check called with parameter', async () => {
      await userService.getUser();

      expect(mockUserRepository.findAllUser).toHaveBeenCalledWith();  
    });

    it('check return the correct value.', async () => {
      const res = await userService.getUser();
      expect(res).toEqual(userArray);
    });
  });

  describe('findOne', () => {
    const mockUser = new MockUser() as unknown as User;
    const fields = {
      id: mockUser.id,
    };

    beforeEach(async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockReturnValue(Promise.resolve(mockUser));
    });

    it('should be defined', () => {
      expect(userService.findOne).toBeDefined();
    });

    it('type check', () => {
      expect(typeof userService.findOne).toBe('function');
    });


    it('check called time', async () => {
      await userService.findOne(fields);

      expect(mockUserRepository.findOne).toBeCalledTimes(1);
    });

    it('check called with parameter', async () => {
      await userService.findOne(fields);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: fields
      });  
    });

    it('check return the correct value.', async () => {
      const res = await userService.findOne(fields);
      expect(res).toEqual(mockUser);
    });
  });

  describe('update', () => {
    const mockUser = new MockUser() as unknown as User;
    const { id, ...rest } = mockUser;

    beforeEach(async () => {
      jest.spyOn(mockUserRepository, 'create').mockReturnValue(mockUser);
      jest.spyOn(mockUserRepository, 'save').mockReturnValue(Promise.resolve(mockUser));
    });

    it('should be defined', () => {
      expect(userService.update).toBeDefined();
    });

    it('type check', () => {
      expect(typeof userService.update).toBe('function');
    });

    it('check called time', async () => {
      await userService.update(mockUser.id, mockUser);

      expect(mockUserRepository.create).toBeCalledTimes(1);
      expect(mockUserRepository.save).toBeCalledTimes(1);
    });

    it('check called with parameter', async () => {
      await userService.update(mockUser.id, mockUser);

      expect(mockUserRepository.create).toHaveBeenCalledWith({ id, ...rest } as DeepPartial<User>);
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('check return the correct value.', async () => {
      const res = await userService.update(mockUser.id, mockUser);
      expect(res).toEqual(mockUser);
    });
  });

  describe('softDelete', () => {
    const mockUser = new MockUser() as unknown as User;

    it('should be defined', () => {
      expect(userService.softDelete).toBeDefined();
    });

    it('type check', () => {
      expect(typeof userService.softDelete).toBe('function');
    });

    it('check called time', async () => {
      await userService.softDelete(mockUser.id);

      expect(mockUserRepository.softDelete).toBeCalledTimes(1);
    });

    it('check called with parameter', async () => {
      await userService.softDelete(mockUser.id);

      expect(mockUserRepository.softDelete).toHaveBeenCalledWith(mockUser.id);  
    });

    it('check return the correct value.', async () => {
      const res = await userService.softDelete(mockUser.id);
      expect(res).toEqual(undefined);
    });
  });

  describe('save', () => {
    const mockUser = new MockUser() as unknown as User;

    beforeEach(async () => {
      jest.spyOn(mockUserRepository, 'save').mockReturnValue(Promise.resolve(mockUser));
    });

    it('should be defined', () => {
      expect(userService.save).toBeDefined();
    });

    it('type check', () => {
      expect(typeof userService.save).toBe('function');
    });


    it('check called time', async () => {
      await userService.save(mockUser);

      expect(mockUserRepository.save).toBeCalledTimes(1);
    });

    it('check called with parameter', async () => {
      await userService.save(mockUser);

      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);  
    });

    it('check return the correct value.', async () => {
      const res = await userService.save(mockUser);
      expect(res).toEqual(mockUser);
    });
  });
});