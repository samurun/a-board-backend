import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<void> {
    const { username, password } = createUserDto;

    // hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
      // create user
      const user = this.userRepository.create({
        username,
        password: hashedPassword,
      });

      // save user
      await this.userRepository.save(user);
    } catch (error) {
      //
      if (error.code === '23505') {
        throw new ConflictException('user already exists');
      }

      // internal server error
      throw new InternalServerErrorException();
    }
  }

  findAll() {
    return this.userRepository.find();
  }

  async findOne(id: string) {
    const founded = await this.userRepository.findOneBy({ id });

    // not found
    if (!founded) {
      throw new NotFoundException();
    }

    return founded;
  }

  async findByUsername(username: string) {
    const founded = await this.userRepository.findOneBy({ username });

    // not found
    if (!founded) {
      throw new NotFoundException();
    }
    return founded;
  }
}
