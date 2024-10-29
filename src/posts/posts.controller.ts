import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  create(
    @Body() createPostDto: CreatePostDto,
    @Request() req: Request & { user: { sub: string } },
  ) {
    return this.postsService.create(createPostDto, req.user.sub);
  }

  @Get()
  findAll(@Query() query?: { community?: string; title?: string }) {
    return this.postsService.findAll(query);
  }

  @Get('my')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async findMyPosts(
    @Request() { user: { sub: userId } }: Request & { user: { sub: string } },
    @Query() query?: { community?: string; title?: string },
  ) {
    return this.postsService.findMyPosts(userId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
}
