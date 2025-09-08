import { UserEntity } from '../../user/infrastructure/entities/user.entity';

export type LoginResponseType = Readonly<{
  token: string;
  refreshToken: string;
  tokenExpires: number;
  user: UserEntity;
}>;
