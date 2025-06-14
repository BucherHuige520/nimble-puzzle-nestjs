import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/users.entity';
import { Task } from '../tasks/tasks.entity';

export const testDatabaseConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: ':memory:',
  logging: false,
  synchronize: true,
  entities: [Task, User],
};

export default registerAs('database', (): TypeOrmModuleOptions => {
  const common = {
    logging: process.env.DB_LOGGING === 'true',
    synchronize: process.env.DB_SYNC === 'true',
  };
  if (process.env.DB_TYPE === 'sqlite') {
    return {
      type: 'sqlite',
      database: 'nimble.db',
      ...common,
    };
  } else if (process.env.DB_TYPE === 'postgres') {
    return {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'postgres',
      database: process.env.DB_NAME || 'nimble',
      ...common,
    };
  }

  throw new Error(
    'Unsupported database type. Please set DB_TYPE to sqlite or postgres.',
  );
});
