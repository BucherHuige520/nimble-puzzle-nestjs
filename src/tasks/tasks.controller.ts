import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ChangeTaskStatusDto, CreateTaskDto } from './dto';
import { TasksService } from './tasks.service';
import { AuthService } from '../auth/auth.service';

@Controller('task')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly authService: AuthService,
  ) {}

  @Get(':id')
  getTaskById(@Param('id', ParseIntPipe) id: number) {
    const task = this.tasksService.getTaskById(
      this.authService.getCurrentUser().id, // or check user id after task fetched
      id,
    );
    return task;
  }

  @Post()
  addTask(@Body() createTaskDto: CreateTaskDto) {
    const userId = this.authService.getCurrentUser().id;
    return this.tasksService.addTask(userId, createTaskDto);
  }

  @Put(':id/status')
  changeTaskStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() status: ChangeTaskStatusDto['status'], // or import TaskStatus type directly
  ) {
    const userId = this.authService.getCurrentUser().id;
    return this.tasksService.changeTaskStatus(userId, { id, status });
  }

  @Get()
  getTasksByUser() {
    const user = this.authService.getCurrentUser();
    return this.tasksService.getTasks(user.id);
  }
}
