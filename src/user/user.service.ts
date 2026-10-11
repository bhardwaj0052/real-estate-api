import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { User } from './schema/userSchema';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
  async createUser(createUserDto: CreateUserDto) {
    try {
      if (createUserDto.role === 'ADMIN') {
        throw new ForbiddenException('Admin registration is not allowed.');
      }
      const existinguser = await this.userModel.exists({
        $or: [{ email: createUserDto.email }, { phone: createUserDto.phone }],
      });
      if (existinguser) {
        throw new ConflictException('Already has an account');
      }
      const passwordHash = await bcrypt.hash(createUserDto.password, 10);
      const user = await this.userModel.create({
        ...createUserDto,
        password: passwordHash,
      });
      return {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone,
      };
    } catch {
      throw new NotFoundException();
    }
  }
  async createAdmin(createUserDto: CreateUserDto) {
    try {
      if (createUserDto.role !== 'ADMIN') {
        throw new ForbiddenException('Only admin registration is allowed.');
      }
      const existinguser = await this.userModel.exists({
        $or: [{ email: createUserDto.email }, { phone: createUserDto.phone }],
      });
      if (existinguser) {
        throw new ConflictException('Email already has an account');
      }
      const passwordHash = await bcrypt.hash(createUserDto.password, 10);
      const user = await this.userModel.create({
        ...createUserDto,
        password: passwordHash,
      });
      return {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone,
      };
    } catch {
      throw new NotFoundException();
    }
  }
}
