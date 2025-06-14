import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { AuthService } from './../src/auth/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { testDatabaseConfig } from './../src/database/database.config';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(testDatabaseConfig), AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const authService = app.get(AuthService);
    await authService.register({
      username: 'testuser',
      password: 'testpass',
    });
  });

  it('/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'testuser', password: 'testpass' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('accessToken');
      });
  });

  it('/auth/login (POST) with wrong credentials', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'wronguser', password: 'wrongpass' })
      .expect(401)
      .expect((res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body.message).toBe('username or password is incorrect');
      });
  });

  it('/auth/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'newuser', password: 'newpass' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body.username).toBe('newuser');
      });
  });

  it('/auth/info (GET)', async () => {
    const authService = app.get(AuthService);
    const token = await authService.login({
      username: 'testuser',
      password: 'testpass',
    });
    return request(app.getHttpServer())
      .get('/auth/info')
      .set('Authorization', `Bearer ${token.accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('username', 'testuser');
      });
  });

  it('/auth/info (GET) without token', () => {
    return request(app.getHttpServer())
      .get('/auth/info')
      .expect(401)
      .expect((res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body.message).toBe('Unauthorized');
      });
  });
});
