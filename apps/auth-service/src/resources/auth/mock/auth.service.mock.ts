import { authResponseStub } from '../../../database/stubs/auth.stub';

export const AuthServiceMock = jest.fn().mockReturnValue({
  register: jest.fn().mockResolvedValue(authResponseStub()),
  login: jest.fn().mockResolvedValue(authResponseStub()),
});
