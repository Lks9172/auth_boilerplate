import { EntityRepository, Repository } from 'typeorm';
import { Account } from './account.class';
import { User } from './user.entity'

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    async createUser(account: Account): Promise<User> {    
        const user = this.create({
          userId: account.userId,
          password: account.hashedPw,
          role: account.role,
        });
    
        await this.save(user);
        return user;
    }
}
