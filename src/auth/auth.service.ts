import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/schema/userSchema';
import { LoginDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    try {
      const user = await this.userModel.findOne({
        email: loginDto.email,
      });
      if (!user) {
        throw new UnauthorizedException('Invalid email');
      }
      const match = await bcrypt.compare(loginDto.password, user.password);
      if (!match) {
        throw new UnauthorizedException('Invalid password');
      }
      const payload = {
        sub: user.id,
        role: user.role,
      };
      const token = await this.jwtService.signAsync(payload);
      return { access_token: token, role: user.role };
    } catch {
      throw new UnauthorizedException();
    }
  }
  async getuserById(id: string) {
    const user = await this.userModel.findOne({
      id: id,
    });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
    };
  }
}
