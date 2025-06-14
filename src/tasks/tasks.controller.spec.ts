import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { testDatabaseConfig } from '../database/database.config';
import { Task } from './tasks.entity';
import { AuthService } from '../auth/auth.service';
import { Repository } from 'typeorm';
import { User } from '../users/users.entity';
import { TasksService } from './tasks.service';

describe('TasksController', () => {
  let controller: TasksController;
  const userId = 1; // Mock user ID for testing

  beforeEach(async () => {
    const authServiceMock = {
      getCurrentUser: jest.fn().mockReturnValue({ id: userId }),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testDatabaseConfig),
        TypeOrmModule.forFeature([User, Task]),
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        TasksService,
      ],
      controllers: [TasksController],
    }).compile();

    controller = module.get<TasksController>(TasksController);

    // add mock user
    const userRepository = module.get<Repository<User>>(
      getRepositoryToken(User),
    );
    await userRepository.save({
      id: 1,
      username: 'testuser',
      password: 'testpass',
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should add a task', async () => {
    const taskDto = { title: 'Test Task' };
    const task = await controller.addTask(taskDto);
    expect(task).toBeDefined();
    expect(task.title).toBe(taskDto.title);
    expect(task.status).toBe('pending');
    expect(task.user.id).toBe(userId);
  });

  it('should change task status', async () => {
    const task = await controller.addTask({ title: 'Change Status Task' });
    const updatedTask = await controller.changeTaskStatus(task.id, 'completed');
    expect(updatedTask.status).toBe('completed');
  });

  it('should get tasks by user', async () => {
    await controller.addTask({ title: 'User Task 1' });
    await controller.addTask({ title: 'User Task 2' });

    const tasks = await controller.getTasksByUser();
    expect(tasks.length).toBe(2);
    expect(tasks[0].title).toBe('User Task 1');
    expect(tasks[1].title).toBe('User Task 2');
  });

  it('should get task by id', async () => {
    const task = await controller.addTask({ title: 'Get Task by ID' });
    const foundTask = await controller.getTaskById(task.id);
    expect(foundTask).toBeDefined();
    expect(foundTask.id).toBe(task.id);
    expect(foundTask.title).toBe('Get Task by ID');
  });

  it('should throw NotFoundException for non-existing task', async () => {
    await expect(controller.changeTaskStatus(999, 'completed')).rejects.toThrow(
      'Task #999 not found',
    );
  });

  it('should throw NotFoundException for non-existing task by ID', async () => {
    await expect(controller.getTaskById(999)).rejects.toThrow(
      'Task #999 not found',
    );
  });

  it('should throw NotFoundException for task not belonging to user', async () => {
    const anotherUserId = 2;
    const task = await controller.addTask({ title: 'Another User Task' });

    // Mock the auth service to return a different user ID
    jest.spyOn(controller['authService'], 'getCurrentUser').mockReturnValue({
      id: anotherUserId,
      username: 'anotheruser',
    });

    await expect(
      controller.changeTaskStatus(task.id, 'completed'),
    ).rejects.toThrow('Task #1 not found');
  });
});
