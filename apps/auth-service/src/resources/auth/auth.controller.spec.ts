import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthServiceMock } from './mock/auth.service.mock';
import { authResponseStub } from '../../database/stubs/auth.stub';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    })
      .overrideProvider(AuthService)
      .useClass(AuthServiceMock)
      .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    const dto: RegisterDto = {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      password: 'secret123',
    };

    it('should return auth response on success', async () => {
      const result = await controller.register(dto);
      expect(result).toStrictEqual(authResponseStub());
    });

    it('should call service.register with the DTO', async () => {
      await controller.register(dto);
      expect(service.register).toHaveBeenCalledWith(dto);
    });

    it('should propagate ConflictException when email is already registered', async () => {
      jest.spyOn(service, 'register').mockRejectedValueOnce(new ConflictException());
      await expect(controller.register(dto)).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    const dto: LoginDto = {
      email: 'juan@example.com',
      password: 'secret123',
    };

    it('should return auth response on success', async () => {
      const result = await controller.login(dto);
      expect(result).toStrictEqual(authResponseStub());
    });

    it('should call service.login with the DTO', async () => {
      await controller.login(dto);
      expect(service.login).toHaveBeenCalledWith(dto);
    });

    it('should propagate UnauthorizedException on invalid credentials', async () => {
      jest.spyOn(service, 'login').mockRejectedValueOnce(new UnauthorizedException());
      await expect(controller.login(dto)).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
