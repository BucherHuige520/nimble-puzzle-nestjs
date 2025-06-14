import { TaskStatus } from './tasks.entity';

export interface CreateTaskDto {
  title: string;
}

export interface ChangeTaskStatusDto {
  id: number;
  status: TaskStatus;
}
