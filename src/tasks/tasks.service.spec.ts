import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { testDatabaseConfig } from '../database/database.config';
import { User } from '../users/users.entity';
import { Task } from './tasks.entity';
import { Repository } from 'typeorm';
import { ChangeTaskStatusDto } from './dto';

describe('TasksService', () => {
  let service: TasksService;
  const userId = 1;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testDatabaseConfig),
        TypeOrmModule.forFeature([Task, User]),
      ],
      providers: [TasksService],
    }).compile();

    service = module.get<TasksService>(TasksService);

    const userRepository = module.get<Repository<User>>(
      getRepositoryToken(User),
    );
    await userRepository.save({
      id: 1,
      username: 'testuser',
      password: 'testpass',
    });
  });

  it('should added task', () => {
    const taskDto = { title: 'Test Task' };
    return service.addTask(userId, taskDto).then((task) => {
      expect(task).toBeDefined();
      expect(task.title).toBe(taskDto.title);
      expect(task.status).toBe('pending');
      expect(task.user.id).toBe(1);
    });
  });

  it('should change task status', async () => {
    const task = await service.addTask(1, { title: 'Change Status Task' });
    const changeDto: ChangeTaskStatusDto = { id: task.id, status: 'completed' };
    const updatedTask = await service.changeTaskStatus(userId, changeDto);
    expect(updatedTask.status).toBe('completed');

    const foundTask = await service.getTasks(userId);
    expect(foundTask.length).toBe(1);
    expect(foundTask[0].id).toBe(task.id);
    expect(foundTask[0].status).toBe('completed');
    expect(foundTask[0].title).toBe('Change Status Task');
  });

  it('should throw NotFoundException for non-existing task', async () => {
    const changeDto: ChangeTaskStatusDto = { id: 999, status: 'completed' };
    await expect(service.changeTaskStatus(userId, changeDto)).rejects.toThrow(
      'Task #999 not found',
    );
  });

  it('should get tasks for user', async () => {
    await service.addTask(1, { title: 'User Task 1' });
    await service.addTask(1, { title: 'User Task 2' });

    const tasks = await service.getTasks(userId);
    expect(tasks.length).toBe(2);
    expect(tasks[0].title).toBe('User Task 1');
    expect(tasks[1].title).toBe('User Task 2');
  });

  it('should get task by id', async () => {
    const task = await service.addTask(userId, { title: 'Get Task by ID' });
    const foundTask = await service.getTaskById(userId, task.id);
    expect(foundTask).toBeDefined();
    expect(foundTask.id).toBe(task.id);
    expect(foundTask.title).toBe('Get Task by ID');
  });

  it('should throw NotFoundException for non-existing task by ID', async () => {
    await expect(service.getTaskById(userId, 999)).rejects.toThrow(
      'Task #999 not found',
    );
  });
});
