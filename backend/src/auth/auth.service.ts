import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findWithPassword(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user || !user.passwordHash) {
    throw new UnauthorizedException('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const { passwordHash, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { sub: user._id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

    async register(dto: CreateUserDto ) {
    const existing = await this.userService.findByEmail(dto.email).catch(() => null);
    if (existing) throw new BadRequestException('Email đã được sử dụng');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.userService.create({ ...dto});

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return { user, accessToken: token };
  }

}
