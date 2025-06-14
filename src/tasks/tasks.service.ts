import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Task } from './tasks.entity';
import { ChangeTaskStatusDto, CreateTaskDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private taskRepository: Repository<Task>,
  ) {}

  async addTask(userId: number, task: CreateTaskDto): Promise<Task> {
    const newTask = this.taskRepository.create({
      title: task.title,
      status: 'pending',
      user: { id: userId },
    });
    return await this.taskRepository.save(newTask);
  }

  async changeTaskStatus(
    userId: number,
    { id, status }: ChangeTaskStatusDto,
  ): Promise<Task> {
    const task = await this.taskRepository.findOneBy({
      id,
      user: { id: userId },
    });
    if (!task) {
      throw new NotFoundException(`Task #${id} not found`);
    }
    task.status = status;
    return await this.taskRepository.save(task);
  }

  async getTasks(userId: number): Promise<Task[]> {
    return await this.taskRepository.find({
      where: { user: { id: userId } },
    });
  }

  async getTaskById(user: number, id: number): Promise<Task> {
    const task = await this.taskRepository.findOneBy({
      id,
      user: { id: user },
    });
    if (!task) {
      throw new NotFoundException(`Task #${id} not found`);
    }
    return task;
  }
}
