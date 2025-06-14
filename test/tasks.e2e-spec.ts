import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { AuthService } from './../src/auth/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { testDatabaseConfig } from './../src/database/database.config';

describe('TasksController (e2e)', () => {
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

  it('/task (GET) without token', () => {
    return request(app.getHttpServer())
      .get('/task')
      .expect(401)
      .expect((res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body.message).toBe('Unauthorized');
      });
  });

  it('/task (GET) with token', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'testuser', password: 'testpass' })
      .expect(201);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const accessToken = loginResponse.body.accessToken;

    return request(app.getHttpServer())
      .get('/task')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/task (POST) new task without token', () => {
    return request(app.getHttpServer())
      .post('/task')
      .send({ title: 'New Task' })
      .expect(401)
      .expect((res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body.message).toBe('Unauthorized');
      });
  });

  it('/task (POST) new task with token', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'testuser', password: 'testpass' })
      .expect(201);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const accessToken = loginResponse.body.accessToken;

    return request(app.getHttpServer())
      .post('/task')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'New Task' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body.title).toBe('New Task');
      });
  });

  it('/task/:id (GET) get task by id without token', () => {
    return request(app.getHttpServer())
      .get('/task/1')
      .expect(401)
      .expect((res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body.message).toBe('Unauthorized');
      });
  });

  it('/task/:id (GET) get task by id with token', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'testuser', password: 'testpass' })
      .expect(201);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const accessToken = loginResponse.body.accessToken;

    return request(app.getHttpServer())
      .get('/task/1')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404) // Assuming no task with id 1 exists
      .expect((res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body.message).toBe('Task #1 not found');
      });
  });

  it('/task/:id/status (PUT) change task status without token', () => {
    return request(app.getHttpServer())
      .put('/task/1/status')
      .send({ status: 'completed' })
      .expect(401)
      .expect((res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body.message).toBe('Unauthorized');
      });
  });

  it('/task/:id/status (PUT) change task status with token', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'testuser', password: 'testpass' })
      .expect(201);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const accessToken = loginResponse.body.accessToken;

    return request(app.getHttpServer())
      .put('/task/1/status')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'completed' })
      .expect(404) // Assuming no task with id 1 exists
      .expect((res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body.message).toBe('Task #1 not found');
      });
  });
});
