import { Repository } from 'typeorm';
import { UserEntity } from '../infrastructure/entities/user.entity'; // 엔티티 경로 확인
import { CustomRepository } from '../../database/typeorm-ex.decorator';

@CustomRepository(UserEntity)
export class UserRepository extends Repository<UserEntity>{

  async findByEmail(email: string): Promise<UserEntity | null> {
    return await this.findOneBy({ email });
  }

  async findAllUser(): Promise<UserEntity[] | null> {
    return await this.find();
  }

}

