import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/users.entity';
import databaseConfig from './database.config';
import { Task } from '../tasks/tasks.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(databaseConfig)],
      inject: [databaseConfig.KEY],
      useFactory(config: ConfigType<typeof databaseConfig>) {
        return {
          entities: [User, Task],
          ...config,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
