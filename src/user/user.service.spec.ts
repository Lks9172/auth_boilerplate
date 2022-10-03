import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { userCase, createUserDtoCase } from './dto/test_case';
import { Account } from './account.class';
import * as bcrypt from 'bcrypt';


describe('UserService', () => {
  let userService: UserService;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, UserRepository],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('createAccount', () => {
    beforeEach(async () => {
      jest
        .spyOn(userRepository, 'createUser')
        .mockResolvedValue(Promise.resolve(userCase));
      jest.spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.resolve(''));
    });
    it('should be defined', () => {
      expect(userService.createAccount).toBeDefined();
    });

    it('type check', () => {
      expect(typeof userService.createAccount).toBe('function');
    });

    it('check called time', async () => {
      await userService.createAccount(createUserDtoCase);
      expect(userRepository.createUser).toBeCalledTimes(1);
    });

    it('check called with parameter', async () => {
      const account = new Account(createUserDtoCase);

      await account.cipher.setHashPw();
      await userService.createAccount(createUserDtoCase);

      expect(userRepository.createUser).toBeCalledWith(account);
    });

    it('함수의 반환값 확인', async () => {
      const result = await userService.createAccount(createUserDtoCase);
      expect(result).toBe(userCase);
    });
  });
});
