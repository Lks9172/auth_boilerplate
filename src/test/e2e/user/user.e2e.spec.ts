import request from 'supertest';
import { ADMIN_EMAIL, ADMIN_PASSWORD, APP_URL } from '../../utils/constants';

describe('User (e2e)', () => {
  const app = APP_URL;

  it('Login: /api/v1/auth/email/login (POST)', async () => {  // async를 추가하여 비동기 처리를 명시
    const response = await request(app)  // await를 사용하여 비동기 요청의 완료를 기다림
      .post('/api/v1/auth/email/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
      .expect(200)
      .expect(({ body }) => {
        expect(body.token).toBeDefined();
        expect(body.tokenExpires).toBeDefined();
        expect(body.refreshToken).toBeDefined();
        expect(body.user.role).toBeDefined();
      });

      return response;
  });
});
