import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { testDatabaseConfig } from '../database/database.config';
import { User } from './users.entity';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testDatabaseConfig),
        TypeOrmModule.forFeature([User]),
      ],
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find a user by username', async () => {
    await service.addUser('testuser', 'testpass');
    const foundUser = await service.findByUsername('testuser');
    expect(foundUser).toBeDefined();
    expect(foundUser!.username).toBe('testuser');
    expect(foundUser!.password).toBe('testpass'); // Note: In a real app, passwords should be hashed
  });
});
