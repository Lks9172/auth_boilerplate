import { Repository } from 'typeorm';
import { User } from '../domain/user.entity'; // 엔티티 경로 확인
import { CustomRepository } from '../../database/typeorm-ex.decorator';

@CustomRepository(User)
export class UserRepository extends Repository<User>{

  async findByEmail(email: string): Promise<User | null> {
    return await this.findOneBy({ email });
  }

  async findAllUser(): Promise<Promise<User[] | null> > {
    return await this.find();
  }

}

