import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../ports/user.service.port';

@Injectable()
export class UserDomainService {
  create(dto: CreateUserDto): User {
    return new User({
      email: dto.email,
      password: dto.password,
      provider: dto.provider,
      socialId: dto.socialId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      photoId: dto.photoId,
      statusId: dto.statusId,
      roleIds: dto.roleIds || [],
    });
  }

  update(user: User, dto: UpdateUserDto): User {
    if (dto.email) {
      user.updateEmail(dto.email);
    }
    
    if (dto.firstName !== undefined || dto.lastName !== undefined) {
      user.updateProfile(dto.firstName, dto.lastName);
    }

    return user;
  }

  changePassword(user: User, newPassword: string): User {
    user.updatePassword(newPassword);
    return user;
  }

  assignRole(user: User, roleId: number): User {
    user.addRole(roleId);
    return user;
  }

  removeRole(user: User, roleId: number): User {
    user.removeRole(roleId);
    return user;
  }

  validate(user: User): boolean {
    if (user.email && !this.isValidEmail(user.email)) {
      return false;
    }

    if (!user.provider) {
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
