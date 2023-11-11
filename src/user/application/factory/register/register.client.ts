import { UserInfo } from '../../builder/user.builder';

export interface UserRegister
 {
    user: UserInfo;
    setUser(user: UserInfo): void
    register(): Promise<boolean>
}
