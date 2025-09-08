import { Entity, EntityId } from './base.entity';

export interface UserProps {
  email?: string;
  password?: string;
  provider: string;
  socialId?: string;
  firstName?: string;
  lastName?: string;
  photoId?: number;
  statusId: number;
  roleIds: number[];
}

export class User extends Entity<UserProps> {
  constructor(props: UserProps, id?: EntityId) {
    super(props, id);
  }

  // 도메인 로직 메서드들
  get email(): string | undefined {
    return this.props.email;
  }

  get password(): string | undefined {
    return this.props.password;
  }

  get provider(): string {
    return this.props.provider;
  }

  get socialId(): string | undefined {
    return this.props.socialId;
  }

  get firstName(): string | undefined {
    return this.props.firstName;
  }

  get lastName(): string | undefined {
    return this.props.lastName;
  }

  get photoId(): number | undefined {
    return this.props.photoId;
  }

  get statusId(): number {
    return this.props.statusId;
  }

  get roleIds(): number[] {
    return this.props.roleIds;
  }

  // 비즈니스 로직
  hasRole(roleId: number): boolean {
    return this.props.roleIds.includes(roleId);
  }

  addRole(roleId: number): void {
    if (!this.hasRole(roleId)) {
      this.props.roleIds.push(roleId);
    }
  }

  removeRole(roleId: number): void {
    this.props.roleIds = this.props.roleIds.filter(id => id !== roleId);
  }

  updateEmail(email: string): void {
    this.props.email = email;
  }

  updatePassword(password: string): void {
    this.props.password = password;
  }

  updateProfile(firstName?: string, lastName?: string): void {
    this.props.firstName = firstName;
    this.props.lastName = lastName;
  }
}

