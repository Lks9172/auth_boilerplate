import { UserEntity } from '../../../user/infrastructure/entities/user.entity';
import { Session } from '../../../session/entities/session.entity';

export type JwtPayloadType = Pick<UserEntity, 'id' | 'role'> & {
  sessionId: Session['id'];
  iat: number;
  exp: number;
};
