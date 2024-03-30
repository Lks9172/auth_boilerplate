import { AuthProvidersEnum } from '../../auth/domain/auth-providers.enum';


export class MockUser {
  id = 1;
  email = 'test@example.com';
  password = 'hashedpassword'; // 실제 테스트에서는 bcrypt로 해시된 패스워드를 사용하지 않습니다.
  previousPassword = 'previoushashedpassword';
  provider = AuthProvidersEnum.email;
  socialId = null;
  firstName = 'John';
  lastName = 'Doe';
  role = {
    id: 1,
    name: 'User',
  };
  status = {
    id: 1,
    name: 'Active',
  };
  createdAt = new Date();
  updatedAt = new Date();
  deletedAt = null;

  async setPassword() {
    if (this.previousPassword !== this.password) {
      // setPassword가 호출되었을 때의 간단한 행동을 구현
      this.password = 'newhashedpassword';
    }
  }
}

export class MockSocialUser {
  id = 1;
  email = 'newemail@naver.com';
  password = 'hashedpassword'; // 실제 테스트에서는 bcrypt로 해시된 패스워드를 사용하지 않습니다.
  previousPassword = 'previoushashedpassword';
  provider = AuthProvidersEnum.kakao;
  socialId = '1';
  firstName = 'John';
  lastName = 'Doe';
  role = {
    id: 1,
    name: 'User',
  };
  status = {
    id: 1,
    name: 'Active',
  };
  createdAt = new Date();
  updatedAt = new Date();
  deletedAt = null;

  async setPassword() {
    if (this.previousPassword !== this.password) {
      // setPassword가 호출되었을 때의 간단한 행동을 구현
      this.password = 'newhashedpassword';
    }
  }
}

export class MockInActiveUser {
  id = 1;
  email = 'test@example.com';
  password = 'hashedpassword'; // 실제 테스트에서는 bcrypt로 해시된 패스워드를 사용하지 않습니다.
  previousPassword = 'previoushashedpassword';
  provider = AuthProvidersEnum.email;
  socialId = null;
  firstName = 'John';
  lastName = 'Doe';
  role = {
    id: 1,
    name: 'User',
  };
  status = {
    id: 2,
    name: 'inactive',
  };
  createdAt = new Date();
  updatedAt = new Date();
  deletedAt = null;

  async setPassword() {
    if (this.previousPassword !== this.password) {
      // setPassword가 호출되었을 때의 간단한 행동을 구현
      this.password = 'newhashedpassword';
    }
  }
}
