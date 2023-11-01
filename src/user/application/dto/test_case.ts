import { CreateUserDto } from './createUser.dto';

export const userCase: any = 
    {
      userId: 'testuser123',
      role: 'basicuser',
      password: 'password',
      accessToken: null,
      refreshToken: null,
    };

export const createUserDtoCase: CreateUserDto = 
    {
      userId: 'testuser123',
      role: 'basicuser',
      password: 'password'
    };
