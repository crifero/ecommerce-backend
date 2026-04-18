import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '@models/user.model';
import { Role } from '@models/role.model';
import { authResponseStub, userStub } from '../../database/stubs/auth.stub';

const mockRole = { id: 1, name: 'user', isActive: true };
const mockUser = {
  id: userStub().id,
  name: userStub().name,
  email: userStub().email,
  password: 'hashed_password',
  isActive: true,
  wasDeleted: false,
  role: mockRole,
};

const userModelMock = {
  findOne: jest.fn(),
  create: jest.fn(),
};

const roleModelMock = {
  findOne: jest.fn(),
};

const jwtServiceMock = {
  sign: jest.fn().mockReturnValue('signed.jwt.token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(User), useValue: userModelMock },
        { provide: getModelToken(Role), useValue: roleModelMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    const dto = { name: 'Juan Pérez', email: 'juan@example.com', password: 'secret123' };

    it('should register a new user and return auth response', async () => {
      userModelMock.findOne.mockResolvedValue(null);
      roleModelMock.findOne.mockResolvedValue(mockRole);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed_password' as never);
      userModelMock.create.mockResolvedValue({ ...mockUser, role: undefined });

      const result = await service.register(dto);

      expect(result).toStrictEqual(authResponseStub());
      expect(userModelMock.findOne).toHaveBeenCalledWith({ where: { email: dto.email, wasDeleted: false } });
      expect(roleModelMock.findOne).toHaveBeenCalledWith({ where: { name: 'user', isActive: true } });
    });

    it('should throw ConflictException when email is already registered', async () => {
      userModelMock.findOne.mockResolvedValue(mockUser);

      await expect(service.register(dto)).rejects.toBeInstanceOf(ConflictException);
      expect(userModelMock.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when default role does not exist', async () => {
      userModelMock.findOne.mockResolvedValue(null);
      roleModelMock.findOne.mockResolvedValue(null);

      await expect(service.register(dto)).rejects.toBeInstanceOf(NotFoundException);
      expect(userModelMock.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const dto = { email: 'juan@example.com', password: 'secret123' };

    it('should login and return auth response', async () => {
      userModelMock.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.login(dto);

      expect(result).toStrictEqual(authResponseStub());
      expect(userModelMock.findOne).toHaveBeenCalledWith({
        where: { email: dto.email, wasDeleted: false },
        include: [{ model: Role, as: 'role' }],
      });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      userModelMock.findOne.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('should throw UnauthorizedException when account is disabled', async () => {
      userModelMock.findOne.mockResolvedValue({ ...mockUser, isActive: false });

      await expect(service.login(dto)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      userModelMock.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.login(dto)).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
