import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  beforeEach(async () => {
    usersService = {
      findByUsername: jest.fn(),
      create: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('signIn', () => {
    it('should return an access token if credentials are valid', async () => {
      const loginDto = { username: 'testuser', password: 'testpass' };
      const user = {
        id: '1',
        username: 'testuser',
        password: 'hashedpass',
        name: 'Test User',
        posts: [],
        comments: [],
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(usersService, 'findByUsername').mockResolvedValue(user);
      (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockResolvedValue(true);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('token');

      const result = await authService.signIn(loginDto);

      expect(result).toEqual({ access_token: 'token' });
      expect(usersService.findByUsername).toHaveBeenCalledWith('testuser');
      expect(bcrypt.compare).toHaveBeenCalledWith('testpass', 'hashedpass');
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: '1',
        username: 'testuser',
      });
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      const loginDto = { username: 'testuser', password: 'wrongpass' };
      const user = {
        id: '1',
        username: 'testuser',
        password: 'hashedpass',
        name: 'Test User',
        posts: [],
        comments: [],
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(usersService, 'findByUsername').mockResolvedValue(user);
      (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockResolvedValue(false);

      await expect(authService.signIn(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    it('should call usersService.create with the correct parameters', async () => {
      const registerDto: CreateUserDto = {
        username: 'newuser',
        password: 'newpass',
        name: 'New User',
      };
      const createSpy = jest
        .spyOn(usersService, 'create')
        .mockResolvedValue(undefined);

      await authService.register(registerDto);

      expect(createSpy).toHaveBeenCalledWith(registerDto);
    });
  });
});
