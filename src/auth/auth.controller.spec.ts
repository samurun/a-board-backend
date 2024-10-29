import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../auth/auth.guard';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            signIn: jest.fn().mockResolvedValue({ access_token: 'token' }),
          },
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UsersService,
          useValue: {
            findByUsername: jest.fn().mockResolvedValue({
              id: 1,
              username: 'testuser',
              name: 'Test User',
              created_at: new Date(),
              updated_at: new Date(),
            }),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true }) // Mock the AuthGuard
      .compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should call authService.register with correct parameters', async () => {
      const createUserDto: CreateUserDto = {
        username: 'test',
        password: 'test',
        name: 'test',
      };

      await authController.signUp(createUserDto);
      expect(authService.register).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('signIn', () => {
    it('should return an access token', async () => {
      const loginDto: LoginDto = { username: 'test', password: 'test' };
      const result = await authController.signIn(loginDto);
      expect(result).toEqual({ access_token: 'token' });
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const req = { user: { username: 'testuser' } };
      const result = await authController.getProfile(req);
      expect(result).toEqual({
        id: 1,
        username: 'testuser',
        name: 'Test User',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });
});
