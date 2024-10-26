import { UsersService } from 'src/users/users.service';
import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('/register')
  async singUp(@Body() authCredentialsDto: CreateUserDto): Promise<void> {
    return this.authService.register(authCredentialsDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/login')
  async signIn(
    @Body() authCredentialsDto: LoginDto,
  ): Promise<{ access_token: string }> {
    return this.authService.signIn(authCredentialsDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.usersService.findByUsername(req.user.username);
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }
}
