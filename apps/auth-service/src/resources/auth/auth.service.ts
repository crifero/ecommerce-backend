import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@models/user.model';
import { Role } from '@models/role.model';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, UserResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Role) private readonly roleModel: typeof Role,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.userModel.findOne({
      where: { email: dto.email, wasDeleted: false },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const role = await this.roleModel.findOne({ where: { name: 'user', isActive: true } });
    if (!role) {
      throw new NotFoundException('Default role not found — run seeders first');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.create(
      {
        name: dto.name,
        email: dto.email,
        password: hashed,
        roleId: role.id,
        isActive: true,
        wasDeleted: false,
      } as any,
    );

    user.role = role;
    return this.buildResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userModel.findOne({
      where: { email: dto.email, wasDeleted: false },
      include: [{ model: Role, as: 'role' }],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildResponse(user);
  }

  private buildResponse(user: User): AuthResponseDto {
    const roleName = user.role?.name ?? 'user';
    const payload = { sub: user.id, email: user.email, role: roleName };
    const accessToken = this.jwtService.sign(payload);

    const userResponse: UserResponseDto = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: roleName,
    };

    return { accessToken, user: userResponse };
  }
}
