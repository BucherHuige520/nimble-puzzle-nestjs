import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtTestConfig: JwtModuleOptions = {
  global: true,
  secret: 'test-secret',
  signOptions: {
    expiresIn: '20s',
  },
};

export default registerAs('jwt', () => ({
  global: true,
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: process.env.JWT_EXPIRATION || '1h',
  },
}));
