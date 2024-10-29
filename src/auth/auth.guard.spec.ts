import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let jwtService: Partial<JwtService>;

  beforeEach(() => {
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('token'),
      verifyAsync: jest.fn(),
    };

    authGuard = new AuthGuard(jwtService as JwtService);
  });

  describe('canActivate', () => {
    it('should return true if token is valid', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid.token.here',
        },
      } as unknown as Request;

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({ userId: 1 });

      const result = await authGuard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockRequest['user']).toEqual({ userId: 1 });
    });

    it('should throw UnauthorizedException if token is missing', async () => {
      const mockRequest = {
        headers: {},
      } as unknown as Request;

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      await expect(authGuard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer invalid.token.here',
        },
      } as unknown as Request;

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValue(new Error('Invalid token'));

      await expect(authGuard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
