import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { UsersService } from 'src/users/users.service';
import { PostsService } from 'src/posts/posts.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
  ) {}

  async create(createCommentDto: CreateCommentDto, postId: string, user: any) {
    try {
      // Check if the author and post exist
      const [author, post] = await Promise.all([
        this.usersService.findOne(user),
        this.postsService.findOne(postId),
      ]);

      const comment = this.commentRepository.create({
        ...createCommentDto,
        author,
        post,
      });

      return await this.commentRepository.save(comment);
    } catch (error) {
      throw new Error(`Failed to create comment: ${error.message}`);
    }
  }

  async findAll() {
    // Find all comments
    const founded = await this.commentRepository.find({
      relations: ['author'],
      select: {
        author: {
          id: true,
          name: true,
          username: true,
        },
      },
      order: {
        updated_at: 'DESC',
      },
    });

    if (!founded) {
      throw new NotFoundException();
    }

    return founded;
  }

  async findAllByPostId(postId: string) {
    // Find all comments by post id
    const founded = await this.commentRepository.find({
      where: { post: { id: postId } },
      relations: ['author'],
      select: {
        author: {
          id: true,
          name: true,
          username: true,
        },
      },
      order: {
        updated_at: 'DESC',
      },
    });

    if (!founded) {
      throw new NotFoundException();
    }

    return founded;
  }

  async findOne(id: string) {
    // Check if the comment exists
    const founded = await this.commentRepository.findOne({
      where: { id },
    });

    if (!founded) {
      throw new NotFoundException();
    }

    return founded;
  }

  async update(id: string, updateCommentDto: UpdateCommentDto) {
    try {
      // Check if the comment exists
      const commentExists = await this.findOne(id);

      // Update the comment
      const updatedComment = await this.commentRepository.save({
        ...commentExists,
        ...updateCommentDto,
      });

      return updatedComment;
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while updating the comment',
      );
    }
  }

  async remove(id: string) {
    try {
      // Check if the comment exists
      await this.findOne(id);

      // Delete the comment
      await this.commentRepository.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete comment: ${error.message}`);
    }
  }
}
