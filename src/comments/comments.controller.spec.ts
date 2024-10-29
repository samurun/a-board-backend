import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtService } from '@nestjs/jwt';
import { UpdateCommentDto } from './dto/update-comment.dto';

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: CommentsService;

  const mockCommentsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findAllByPostId: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: mockCommentsService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    service = module.get<CommentsService>(CommentsService);
  });

  describe('create', () => {
    it('should create a comment', async () => {
      const createCommentDto: CreateCommentDto = {
        content: 'Test comment',
      };
      const postId = 'post-123';
      const userId = 'user-123';
      const mockRequest = {
        user: { sub: userId },
      };

      mockCommentsService.create.mockResolvedValue({
        id: 'comment-123',
        ...createCommentDto,
        postId,
        userId,
      });

      const result = await controller.create(
        postId,
        mockRequest as any,
        createCommentDto,
      );

      expect(service.create).toHaveBeenCalledWith(
        createCommentDto,
        postId,
        userId,
      );
      expect(result).toEqual({
        id: 'comment-123',
        content: 'Test comment',
        postId,
        userId,
      });
    });
  });

  describe('findAll', () => {
    it('should return all comments', async () => {
      const mockComments = [{ id: '1', content: 'Comment 1' }];
      mockCommentsService.findAll.mockResolvedValue(mockComments);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockComments);
    });
  });

  describe('findOne', () => {
    it('should return a single comment', async () => {
      const commentId = '1';
      const mockComment = { id: commentId, content: 'Test comment' };
      mockCommentsService.findOne.mockResolvedValue(mockComment);

      const result = await controller.findOne(commentId);

      expect(service.findOne).toHaveBeenCalledWith(commentId);
      expect(result).toEqual(mockComment);
    });

    it('should handle errors when finding a comment', async () => {
      const commentId = '1';
      mockCommentsService.findOne.mockRejectedValue(
        new Error('Comment not found'),
      );

      await expect(controller.findOne(commentId)).rejects.toThrow(
        'Comment not found',
      );
      expect(service.findOne).toHaveBeenCalledWith(commentId);
    });
  });

  describe('findAllByPostId', () => {
    it('should return all comments for a post', async () => {
      const postId = 'post-123';
      const mockComments = [
        { id: '1', content: 'Comment 1', postId },
        { id: '2', content: 'Comment 2', postId },
      ];
      mockCommentsService.findAllByPostId.mockResolvedValue(mockComments);

      const result = await controller.findAllByPostId(postId);

      expect(service.findAllByPostId).toHaveBeenCalledWith(postId);
      expect(result).toEqual(mockComments);
    });

    it('should handle errors when finding comments by post id', async () => {
      const postId = 'post-123';
      mockCommentsService.findAllByPostId.mockRejectedValue(
        new Error('No comments found'),
      );

      await expect(controller.findAllByPostId(postId)).rejects.toThrow(
        'No comments found',
      );
      expect(service.findAllByPostId).toHaveBeenCalledWith(postId);
    });
  });

  describe('update', () => {
    it('should update a comment', async () => {
      const commentId = '1';
      const updateCommentDto: UpdateCommentDto = {
        content: 'Updated comment',
      };
      const mockUpdatedComment = {
        id: commentId,
        ...updateCommentDto,
      };
      mockCommentsService.update.mockResolvedValue(mockUpdatedComment);

      const result = await controller.update(commentId, updateCommentDto);

      expect(service.update).toHaveBeenCalledWith(commentId, updateCommentDto);
      expect(result).toEqual(mockUpdatedComment);
    });

    it('should handle errors when updating a comment', async () => {
      const commentId = '1';
      const updateCommentDto: UpdateCommentDto = {
        content: 'Updated comment',
      };
      mockCommentsService.update.mockRejectedValue(new Error('Update failed'));

      await expect(
        controller.update(commentId, updateCommentDto),
      ).rejects.toThrow('Update failed');
      expect(service.update).toHaveBeenCalledWith(commentId, updateCommentDto);
    });
  });

  describe('remove', () => {
    it('should remove a comment', async () => {
      const commentId = '1';
      const mockDeletedComment = { id: commentId, content: 'Deleted comment' };
      mockCommentsService.remove.mockResolvedValue(mockDeletedComment);

      const result = await controller.remove(commentId);

      expect(service.remove).toHaveBeenCalledWith(commentId);
      expect(result).toEqual(mockDeletedComment);
    });

    it('should handle errors when removing a comment', async () => {
      const commentId = '1';
      mockCommentsService.remove.mockRejectedValue(new Error('Delete failed'));

      await expect(controller.remove(commentId)).rejects.toThrow(
        'Delete failed',
      );
      expect(service.remove).toHaveBeenCalledWith(commentId);
    });
  });
});
