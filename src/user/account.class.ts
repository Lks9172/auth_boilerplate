import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from 'bcrypt'

export class Account {
    userId: string;
    private password: string;
    hashedPw: string;
    role: string;
    saltRounds = 10;

    constructor(createUserDto: CreateUserDto) {
        this.userId = createUserDto.userId;
        this.role = createUserDto.role;
    }
    setPassword(password: string){
        this.password = password
    }

    setHashPw(): boolean {
        const salt = bcrypt.genSaltSync(this.saltRounds);
        this.hashedPw = bcrypt.hashSync(this.password, salt);
        return true
    }

    comparePassword(encoded_pw: string): boolean {
        const salt = bcrypt.genSaltSync(this.saltRounds);
        const hash = bcrypt.hashSync(encoded_pw, salt);
        return bcrypt.compareSync(encoded_pw, hash);
    }
}
