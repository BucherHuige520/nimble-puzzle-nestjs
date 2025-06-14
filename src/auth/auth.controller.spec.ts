import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { User } from '../users/users.entity';
import { jwtTestConfig } from './jwt.config';
import { testDatabaseConfig } from '../database/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testDatabaseConfig),
        TypeOrmModule.forFeature([User]),
        JwtModule.register(jwtTestConfig),
        Reflector,
      ],
      providers: [UsersService, AuthService, AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('login failed', async () => {
    await expect(
      controller.login({
        username: 'NoExistingUser',
        password: 'wrongPassword',
      }),
    ).rejects.toThrow('username or password is incorrect');
  });

  it('register and login success', async () => {
    await controller.register({
      username: 'testuser',
      password: 'testpassword',
    });
    const result = await controller.login({
      username: 'testuser',
      password: 'testpassword',
    });
    expect(result).toHaveProperty('accessToken');
    expect(typeof result.accessToken).toBe('string');
  });
});
