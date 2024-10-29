import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { ILike, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly usersService: UsersService,
  ) {}

  async create(createPostDto: CreatePostDto, authorId: string): Promise<Post> {
    try {
      // Find the author
      const author = await this.usersService.findOne(authorId);

      // Create the new post
      const newPost = this.postRepository.create({
        ...createPostDto,
        author,
      });

      // Save the new post
      return await this.postRepository.save(newPost);
    } catch (error) {
      // If the author does not exist, throw a bad request exception
      if (error instanceof NotFoundException) {
        throw new BadRequestException('Author not found');
      }
      throw new InternalServerErrorException(
        'An error occurred while creating the post',
        { cause: error },
      );
    }
  }

  async findAll({
    community,
    title,
  }: {
    community?: string;
    title?: string;
  }): Promise<Partial<Post>[]> {
    // Create the where clause
    const where: Record<string, any> = {
      ...(community && { community }),
      ...(title && { title: ILike(`%${title}%`) }),
    };

    const posts = await this.postRepository.find({
      where, // where clause
      relations: ['author', 'comments', 'comments.author'],
      select: {
        id: true,
        title: true,
        community: true,
        content: true,
        created_at: true,
        author: {
          id: true,
          name: true,
          username: true,
        },
        comments: {
          id: true,
          content: true,
          created_at: true,
          author: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      order: {
        updated_at: 'DESC',
      },
    });

    return posts;
  }

  async findMyPosts(
    authorId: string,
    { community, title }: { community?: string; title?: string },
  ): Promise<Partial<Post>[]> {
    // Create the where clause
    const where: Record<string, any> = {
      ...(community && { community }),
      ...(title && { title: ILike(`%${title}%`) }),
    };

    return this.postRepository.find({
      where: { author: { id: authorId }, ...where },
      relations: ['author', 'comments', 'comments.author'],
      select: {
        id: true,
        title: true,
        community: true,
        content: true,
        created_at: true,
        author: {
          id: true,
          name: true,
          username: true,
        },
        comments: {
          id: true,
          content: true,
          created_at: true,
          author: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      order: {
        updated_at: 'DESC',
      },
    });
  }

  async findOne(id: string) {
    // Check if the post exists
    const founded = await this.postRepository.findOne({
      where: { id },
      relations: ['author', 'comments', 'comments.author'],
      select: {
        id: true,
        title: true,
        community: true,
        content: true,
        created_at: true,
        updated_at: true,
        author: {
          id: true,
          name: true,
          username: true,
        },
        comments: {
          id: true,
          content: true,
          created_at: true,
          author: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    // If the post does not exist, throw a not found exception
    if (!founded) {
      throw new NotFoundException();
    }

    // Return the post
    return founded;
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    try {
      // Check if the post exists
      const existingPost = await this.findOne(id);

      // Update the post
      const updatedPost = await this.postRepository.save({
        ...existingPost,
        ...updatePostDto,
      });

      return updatedPost;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while updating the post',
        { cause: error },
      );
    }
  }

  async remove(id: string) {
    try {
      // Check if the post exists
      await this.findOne(id);

      // Delete the post
      await this.postRepository.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        // Re-throw NotFoundException from findOne
        throw error;
      } else if (error.message.includes('invalid input syntax for type uuid')) {
        throw new BadRequestException('Invalid post ID format');
      } else {
        console.error(error);
        throw new InternalServerErrorException(
          'An error occurred while deleting the post.',
        );
      }
    }
  }
}
