import { Injectable, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../domain/user.entity'; // 엔티티 경로 확인
import { UserInfo } from '../application/builder/user.builder';
import { AppDataSource } from '../../database/data-source';
import { CustomRepository } from 'src/database/typeorm-ex.decorator';

@CustomRepository(User)
export class UserRepository extends Repository<User>{

  async createUser(accountInfo: UserInfo): Promise<User> {
    const { userId, password, email, name, birthDate, gender } = accountInfo;

    // userId가 아니라 email을 기준으로 체크해야 할 것 같습니다.
    const checkUser = await this.findOne({
      where: { email: email },
    });

    if (checkUser) {
      throw new BadRequestException('이미 존재하는 email입니다.');
    }

    // UserEntity 인스턴스 생성 및 저장
    const newUser = this.create({
      userId,
      password,
      email,
      name,
      birthDate,
      gender,
    });

    await this.save(newUser);

    return newUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.findOneBy({ email });
  }

  async findAllUser(): Promise<Promise<User[] | null> > {
    return await this.find();
  }

}

