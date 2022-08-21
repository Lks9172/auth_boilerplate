import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { Account } from './account.class';
import { User } from './user.entity';
import { UserRepository } from './user.repository';


@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
      ) {}

    async signUp(createUserDto: CreateUserDto): Promise<User | undefined> {
        const account = new Account(createUserDto);
        account.setHashPw(account.password)
        const newUser = await this.userRepository.createUser(account)
        console.log(newUser)
    return newUser;
    }
}
