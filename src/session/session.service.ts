import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindOneOptions, FindOptions, Not, Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { SessionRepository } from './repository/session.repository';
import { User } from '../user/domain/user.entity';
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
    user?: Pick<User, 'id'>;
    excludeId?: Session['id'];
  }): Promise<void> {
    await this.sessionRepository.softDelete({
      ...criteria,
      id: criteria.id ? criteria.id : excludeId ? Not(excludeId) : undefined,
    });
  }
}
