import { Repository } from 'typeorm';
import { CustomRepository } from '../../database/typeorm-ex.decorator';
import { Session } from '../entities/session.entity';

@CustomRepository(Session)
export class SessionRepository extends Repository<Session>{

}

