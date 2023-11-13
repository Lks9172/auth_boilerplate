import { User } from 'src/user/domain/user.entity';
import { JsonWentoken } from '../../jwt';
import { SignInUserDto } from '../../dto/signInUser.dto';

export interface AuthClient
 {
    user: SignInUserDto;
    jwt: JsonWentoken;
    setUser(user: SignInUserDto): void;
    verifyUser(user: User): Promise<boolean>
    login(): Promise<boolean>
}
