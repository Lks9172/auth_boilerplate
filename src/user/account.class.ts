import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from 'bcrypt'

export class Account {
    userId: string;
    password: string;
    hashedPw: string;
    role: string;
    saltRounds = 10;

    constructor(createUserDto: CreateUserDto) {
        this.userId = createUserDto.userId;
        this.password = createUserDto.password;
        this.role = createUserDto.role;
    }

    setHashPw(encoded_pw: string): boolean {
        const salt = bcrypt.genSaltSync(this.saltRounds);
        this.hashedPw = bcrypt.hashSync(encoded_pw, salt);
        return true
    }

    comparePassword(encoded_pw: string): boolean {
        const salt = bcrypt.genSaltSync(this.saltRounds);
        const hash = bcrypt.hashSync(encoded_pw, salt);
        return bcrypt.compareSync(encoded_pw, hash);
    }
}