import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: CreateUserDto): Promise<void> {
    return this.usersService.create(registerDto);
  }

  async signIn(loginDto: CreateUserDto): Promise<{ access_token: string }> {
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
