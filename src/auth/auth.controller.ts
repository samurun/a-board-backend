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

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async singUp(@Body() authCredentialsDto: CreateUserDto): Promise<void> {
    return this.authService.register(authCredentialsDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/login')
  async signIn(
    @Body() authCredentialsDto: CreateUserDto,
  ): Promise<{ access_token: string }> {
    return this.authService.signIn(authCredentialsDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
