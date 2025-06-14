import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { testDatabaseConfig } from '../database/database.config';
import { JwtModule } from '@nestjs/jwt';
import { jwtTestConfig } from './jwt.config';
import { UsersService } from '../users/users.service';
import { User } from '../users/users.entity';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testDatabaseConfig),
        TypeOrmModule.forFeature([User]),
        JwtModule.register(jwtTestConfig),
      ],
      providers: [UsersService, AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register a new user', async () => {
    const registerDto = { username: 'testuser', password: 'testpass' };
    const user = await service.register(registerDto);
    expect(user).toBeDefined();
    expect(user.username).toBe(registerDto.username);
  });

  it('should login an existing user', async () => {
    const registerDto = { username: 'testuser', password: 'testpass' };
    await service.register(registerDto);

    const loginDto = { username: 'testuser', password: 'testpass' };
    const token = await service.login(loginDto);
    expect(token).toBeDefined();
    expect(token.accessToken).toBeDefined();
  });

  it('should throw error for invalid login', async () => {
    const loginDto = { username: 'nonexistent', password: 'wrongpass' };
    await expect(service.login(loginDto)).rejects.toThrow(
      'username or password is incorrect',
    );
  });

  it('should throw error for unregistered user', async () => {
    const registerDto = { username: 'newuser', password: 'newpass' };
    await expect(service.login(registerDto)).rejects.toThrow(
      'username or password is incorrect',
    );
  });
});
