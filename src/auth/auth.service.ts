import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, RegisterDto } from './dto';
import { RequestContext } from 'nestjs-request-context';
import { UsersService } from '../users/users.service';

export interface JwtPayload {
  id: number;
  username: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    const user = await this.usersService.findByUsername(username);
    if (!user || this.hashPassword(password) !== user.password) {
      throw new UnauthorizedException('username or password is incorrect');
    }

    const token = await this.jwtService.signAsync({ username, id: user.id });
    return {
      accessToken: token,
    };
  }

  async register(registerDto: RegisterDto) {
    return await this.usersService.addUser(
      registerDto.username,
      this.hashPassword(registerDto.password),
    );
  }

  private hashPassword(password: string): string {
    return password;
  }

  getCurrentUser(): JwtPayload {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return RequestContext.currentContext.req.user;
  }
}
