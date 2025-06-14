import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard, Public } from './auth.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { jwtTestConfig } from './jwt.config';
import { testDatabaseConfig } from '../database/database.config';
import { User } from '../users/users.entity';
import { Reflector } from '@nestjs/core';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwt: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testDatabaseConfig),
        TypeOrmModule.forFeature([User]),
        JwtModule.register(jwtTestConfig),
        Reflector,
      ],
      providers: [AuthGuard],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwt = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if public', async () => {
    const mockRequest = { user: null };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getClass() {
        @Public()
        class TestClass {}
        return TestClass;
      },
      getHandler() {
        return class {};
      },
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(mockContext)).resolves.toBe(true);
  });

  it('should allow access if not public but with a valid token', async () => {
    const mockRequest = {
      headers: {
        authorization: `Bearer ${jwt.sign({ username: 'testuser' })}`,
      },
      user: null,
    };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getClass() {
        class TestClass {}
        return TestClass;
      },
      getHandler() {
        return class {};
      },
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(mockContext)).resolves.toBe(true);
  });

  it('should deny access if not public and no token', async () => {
    const mockRequest = {
      headers: {},
      user: null,
    };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getClass() {
        class TestClass {}
        return TestClass;
      },
      getHandler() {
        return class {};
      },
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      'Unauthorized',
    );
  });
});
