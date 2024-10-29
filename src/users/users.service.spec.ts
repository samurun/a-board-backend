import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserRepository;

  const mockUser = {
    id: 'some-uuid',
    name: 'Test User',
    username: 'testuser',
    password: 'hashedPassword123',
  };

  beforeEach(async () => {
    mockUserRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    const createUserDto = {
      name: 'Test User',
      username: 'testuser',
      password: 'password123',
    };

    it('should successfully create a user', async () => {
      jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt' as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).resolves.not.toThrow();
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException when username already exists', async () => {
      mockUserRepository.save.mockRejectedValue({ code: '23505' });

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw InternalServerErrorException for other errors', async () => {
      mockUserRepository.save.mockRejectedValue({ code: 'unknown' });

      await expect(service.create(createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      mockUserRepository.find.mockResolvedValue([mockUser]);

      const result = await service.findAll();
      expect(result).toEqual([mockUser]);
      expect(mockUserRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.findOne('some-uuid');
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        id: 'some-uuid',
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('some-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByUsername', () => {
    it('should return a user if found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.findByUsername('testuser');
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        username: 'testuser',
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findByUsername('testuser')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
