import { Repository } from 'typeorm';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';
import { UsersService } from '../users/users.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';

describe('PostsService', () => {
  let service: PostsService;
  let postRepository: Repository<Post>;
  let usersService: UsersService;

  const mockPostRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockUsersService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: getRepositoryToken(Post), useValue: mockPostRepository },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    postRepository = module.get<Repository<Post>>(getRepositoryToken(Post));
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('create', () => {
    const createPostDto = {
      title: 'Test Post',
      content: 'Test Content',
      community: 'test-community',
    };

    const authorId = 'test-author-id';
    const mockAuthor = { id: authorId, name: 'Test Author' };
    const mockPost = { ...createPostDto, author: mockAuthor };

    it('should create a post successfully', async () => {
      mockUsersService.findOne.mockResolvedValue(mockAuthor);
      mockPostRepository.create.mockReturnValue(mockPost);
      mockPostRepository.save.mockResolvedValue(mockPost);

      const result = await service.create(createPostDto, authorId);

      expect(result).toEqual(mockPost);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(authorId);
      expect(mockPostRepository.create).toHaveBeenCalledWith({
        ...createPostDto,
        author: mockAuthor,
      });
      expect(mockPostRepository.save).toHaveBeenCalledWith(mockPost);
    });

    it('should throw BadRequestException when author not found', async () => {
      mockUsersService.findOne.mockRejectedValue(new NotFoundException());

      await expect(service.create(createPostDto, authorId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    const mockPosts = [
      { id: '1', title: 'Post 1' },
      { id: '2', title: 'Post 2' },
    ];

    it('should return all posts', async () => {
      mockPostRepository.find.mockResolvedValue(mockPosts);

      const result = await service.findAll({});

      expect(result).toEqual(mockPosts);
      expect(mockPostRepository.find).toHaveBeenCalled();
    });

    it('should filter posts by community and title', async () => {
      mockPostRepository.find.mockResolvedValue([mockPosts[0]]);

      await service.findAll({ community: 'test', title: 'Post' });

      expect(mockPostRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.any(Object),
        }),
      );
    });
  });

  describe('findOne', () => {
    const mockPost = { id: '1', title: 'Test Post' };

    it('should return a post by id', async () => {
      mockPostRepository.findOne.mockResolvedValue(mockPost);

      const result = await service.findOne('1');

      expect(result).toEqual(mockPost);
      expect(mockPostRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '1' },
        }),
      );
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPostRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updatePostDto = { title: 'Updated Title' };
    const existingPost = { id: '1', title: 'Original Title' };
    const updatedPost = { ...existingPost, ...updatePostDto };

    it('should update a post successfully', async () => {
      mockPostRepository.findOne.mockResolvedValue(existingPost);
      mockPostRepository.save.mockResolvedValue(updatedPost);

      const result = await service.update('1', updatePostDto);

      expect(result).toEqual(updatedPost);
      expect(mockPostRepository.save).toHaveBeenCalledWith({
        ...existingPost,
        ...updatePostDto,
      });
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPostRepository.findOne.mockResolvedValue(null);

      await expect(service.update('1', updatePostDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a post successfully', async () => {
      mockPostRepository.findOne.mockResolvedValue({ id: '1' });
      mockPostRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('1');

      expect(mockPostRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPostRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid UUID', async () => {
      mockPostRepository.findOne.mockRejectedValue({
        message: 'invalid input syntax for type uuid',
      });

      await expect(service.remove('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findMyPosts', () => {
    const mockPosts = [
      { id: '1', title: 'My Post 1' },
      { id: '2', title: 'My Post 2' },
    ];
    const authorId = 'test-author-id';

    it('should return posts for specific author', async () => {
      mockPostRepository.find.mockResolvedValue(mockPosts);

      const result = await service.findMyPosts(authorId, {});

      expect(result).toEqual(mockPosts);
      expect(mockPostRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            author: { id: authorId },
          }),
        }),
      );
    });

    it('should filter author posts by community and title', async () => {
      mockPostRepository.find.mockResolvedValue([mockPosts[0]]);

      await service.findMyPosts(authorId, {
        community: 'test',
        title: 'Post',
      });

      expect(mockPostRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            author: { id: authorId },
          }),
        }),
      );
    });
  });
});
