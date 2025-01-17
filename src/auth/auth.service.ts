import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: CreateUserDto): Promise<void> {
    return this.usersService.create(registerDto);
  }

  async signIn(loginDto: LoginDto): Promise<{ access_token: string }> {
    const { username, password } = loginDto;

    // find user
    const user = await this.usersService.findByUsername(username);

    // compare password
    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { sub: user.id, username: user.username };
      return {
        access_token: await this.jwtService.signAsync(payload), // generate token
      };
    }
    throw new UnauthorizedException();
  }
}
