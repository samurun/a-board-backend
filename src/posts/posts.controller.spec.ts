import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtService } from '@nestjs/jwt';
import { UpdatePostDto } from './dto/update-post.dto';

describe('PostsController', () => {
  let controller: PostsController;
  let service: PostsService;

  const mockPostsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findMyPosts: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: mockPostsService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    service = module.get<PostsService>(PostsService);
  });

  describe('create', () => {
    it('should create a post', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Test Post',
        content: 'Test Content',
        community: 'test-community',
      };

      const userId = 'user123';
      const mockRequest = {
        user: { sub: userId },
      };

      mockPostsService.create.mockResolvedValue({ id: '1', ...createPostDto });

      const result = await controller.create(createPostDto, mockRequest as any);

      expect(result).toEqual({ id: '1', ...createPostDto });
    });
  });

  describe('findAll', () => {
    it('should return all posts with query params', async () => {
      const query = { community: 'test', title: 'search' };
      const mockPosts = [{ id: '1', title: 'Test Post' }];

      mockPostsService.findAll.mockResolvedValue(mockPosts);

      const result = await controller.findAll(query);

      expect(result).toEqual(mockPosts);
    });
  });

  describe('findMyPosts', () => {
    it('should return user posts with query params', async () => {
      const userId = 'user123';
      const query = { community: 'test', title: 'search' };
      const mockRequest = { user: { sub: userId } };
      const mockPosts = [{ id: '1', title: 'My Post' }];

      mockPostsService.findMyPosts.mockResolvedValue(mockPosts);

      const result = await controller.findMyPosts(mockRequest as any, query);

      expect(service.findMyPosts).toHaveBeenCalledWith(userId, query);
      expect(result).toEqual(mockPosts);
    });
  });

  describe('findOne', () => {
    it('should return a single post', async () => {
      const postId = '1';
      const mockPost = { id: postId, title: 'Test Post' };

      mockPostsService.findOne.mockResolvedValue(mockPost);

      const result = await controller.findOne(postId);

      expect(service.findOne).toHaveBeenCalledWith(postId);
      expect(result).toEqual(mockPost);
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      const postId = '1';
      const updatePostDto: UpdatePostDto = { title: 'Updated Title' };
      const mockUpdatedPost = { id: postId, ...updatePostDto };

      mockPostsService.update.mockResolvedValue(mockUpdatedPost);

      const result = await controller.update(postId, updatePostDto);

      expect(service.update).toHaveBeenCalledWith(postId, updatePostDto);
      expect(result).toEqual(mockUpdatedPost);
    });
  });

  describe('remove', () => {
    it('should remove a post', async () => {
      const postId = '1';
      const mockDeletedPost = { id: postId, deleted: true };

      mockPostsService.remove.mockResolvedValue(mockDeletedPost);

      const result = await controller.remove(postId);

      expect(service.remove).toHaveBeenCalledWith(postId);
      expect(result).toEqual(mockDeletedPost);
    });
  });
});
