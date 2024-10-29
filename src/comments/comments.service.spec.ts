import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { PostsService } from '../posts/posts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Comment } from './entities/comment.entity';

describe('CommentsService', () => {
  let service: CommentsService;
  let commentRepository: Repository<Comment>;
  let usersService: UsersService;
  let postsService: PostsService;

  const mockCommentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockUsersService = {
    findOne: jest.fn(),
  };

  const mockPostsService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(Comment),
          useValue: mockCommentRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: PostsService,
          useValue: mockPostsService,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    commentRepository = module.get<Repository<Comment>>(
      getRepositoryToken(Comment),
    );
    usersService = module.get<UsersService>(UsersService);
    postsService = module.get<PostsService>(PostsService);
  });

  describe('create', () => {
    it('should create a comment successfully', async () => {
      const createCommentDto = { content: 'Test comment' };
      const postId = 'post-id';
      const user = { id: 'user-id' };
      const author = { id: 'user-id', name: 'Test User' };
      const post = { id: 'post-id', title: 'Test Post' };
      const createdComment = {
        id: 'comment-id',
        ...createCommentDto,
        author,
        post,
      };

      mockUsersService.findOne.mockResolvedValue(author);
      mockPostsService.findOne.mockResolvedValue(post);
      mockCommentRepository.create.mockReturnValue(createdComment);
      mockCommentRepository.save.mockResolvedValue(createdComment);

      const result = await service.create(createCommentDto, postId, user);

      expect(result).toEqual(createdComment);
    });

    it('should throw error if creation fails', async () => {
      mockUsersService.findOne.mockRejectedValue(new Error('User not found'));

      await expect(
        service.create({ content: 'Test' }, 'post-id', { id: 'user-id' }),
      ).rejects.toThrow('Failed to create comment');
    });
  });

  describe('findAll', () => {
    it('should return all comments', async () => {
      const comments = [
        { id: '1', content: 'Comment 1', author: { id: 'user-1' } },
        { id: '2', content: 'Comment 2', author: { id: 'user-2' } },
      ];
      mockCommentRepository.find.mockResolvedValue(comments);

      const result = await service.findAll();

      expect(result).toEqual(comments);
    });

    it('should throw NotFoundException if no comments found', async () => {
      mockCommentRepository.find.mockResolvedValue(null);

      await expect(service.findAll()).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllByPostId', () => {
    it('should return all comments for a post', async () => {
      const postId = 'post-id';
      const comments = [
        { id: '1', content: 'Comment 1', author: { id: 'user-1' } },
      ];
      mockCommentRepository.find.mockResolvedValue(comments);

      const result = await service.findAllByPostId(postId);

      expect(result).toEqual(comments);
    });

    it('should throw NotFoundException if no comments found for post', async () => {
      const postId = 'post-id';
      mockCommentRepository.find.mockResolvedValue(null);

      await expect(service.findAllByPostId(postId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if no comments found for post', async () => {
      const postId = 'post-id';
      mockCommentRepository.find.mockResolvedValue(null);

      await expect(service.findAllByPostId(postId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a comment by id', async () => {
      const comment = { id: '1', content: 'Test comment' };
      mockCommentRepository.findOne.mockResolvedValue(comment);

      const result = await service.findOne('1');

      expect(result).toEqual(comment);
    });

    it('should throw NotFoundException if comment not found', async () => {
      mockCommentRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a comment successfully', async () => {
      const comment = { id: '1', content: 'Original content' };
      const updateDto = { content: 'Updated content' };
      const updatedComment = { ...comment, ...updateDto };

      mockCommentRepository.findOne.mockResolvedValue(comment);
      mockCommentRepository.save.mockResolvedValue(updatedComment);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(updatedComment);
    });

    it('should throw InternalServerErrorException if update fails', async () => {
      mockCommentRepository.findOne.mockRejectedValue(new Error());

      await expect(service.update('1', { content: 'Updated' })).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a comment successfully', async () => {
      const comment = { id: '1', content: 'Test comment' };
      mockCommentRepository.findOne.mockResolvedValue(comment);
      mockCommentRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('1');

      expect(mockCommentRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw error if deletion fails', async () => {
      mockCommentRepository.findOne.mockRejectedValue(
        new Error('Comment not found'),
      );

      await expect(service.remove('1')).rejects.toThrow(
        'Failed to delete comment',
      );
    });
  });
});
