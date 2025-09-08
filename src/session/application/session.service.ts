import { Injectable } from '@nestjs/common';
import { DeepPartial, FindOneOptions, Not} from 'typeorm';
import { Session } from '../entities/session.entity';
import { SessionRepository } from '../repository/session.repository';
import { UserEntity } from '../../user/infrastructure/entities/user.entity';
import { NullableType } from 'src/utils/types/nullable.type';

@Injectable()
export class SessionService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    ) {}

  async findOne(options: FindOneOptions<Session>): Promise<NullableType<Session>> {
    return this.sessionRepository.findOne({
      where: options.where,
    });
  }

  async create(data: DeepPartial<Session>): Promise<Session> {
    return this.sessionRepository.save(this.sessionRepository.create(data));
  }

  async softDelete({
    excludeId,
    ...criteria
  }: {
    id?: Session['id'];
    user?: Pick<UserEntity, 'id'>;
    excludeId?: Session['id'];
  }): Promise<void> {
    const idCondition = criteria.id ? { id: criteria.id } : excludeId ? { id: Not(excludeId) } : {};

    await this.sessionRepository.softDelete({
      ...criteria,
      ...idCondition,
    });
  }
}
