import { AuthResponseDto } from '../../resources/auth/dto/auth-response.dto';

export const userStub = () => ({
  id: 1,
  name: 'Juan Pérez',
  email: 'juan@example.com',
  role: 'user',
});

export const authResponseStub = (): AuthResponseDto => ({
  accessToken: 'signed.jwt.token',
  user: userStub(),
});
