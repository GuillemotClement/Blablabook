import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { JwtService, TokenExpiredError } from '@nestjs/jwt'; // Importe bien la classe !
import { Reflector } from '@nestjs/core';
import { TokenService } from '../security/token/token.service';
import { CookieService } from '../security/cookie/cookie.service';
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';
import { ExecutionContext } from '@nestjs/common';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;

  const jwtServiceMock = {
    verify: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const tokenServiceMock = {
    rotateTokens: jest.fn(),
  };

  const cookieServiceMock = {
    generateCookiesConfig: jest.fn(),
  };

  const reflectorMock = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    reflectorMock.getAllAndOverride.mockReturnValue(false);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: TokenService, useValue: tokenServiceMock },
        { provide: CookieService, useValue: cookieServiceMock },
        { provide: Reflector, useValue: reflectorMock },
      ],
    }).compile();

    authGuard = module.get<AuthGuard>(AuthGuard);
  });

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });

  describe('authGuard.canActivate', () => {
    const createHttpContext = (
      cookies = {
        jwt_cookie: 'jwt-token',
        refresh_cookie: 'refresh-token',
      },
    ) => {
      const request = {
        cookies,
      };
      const response = {
        cookie: jest.fn(),
        clearCookie: jest.fn(),
      };

      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(request),
          getResponse: jest.fn().mockReturnValue(response),
        }),
      } as unknown as ExecutionContext;

      return { context, request, response };
    };

    it('should allow public routes without requiring cookies', async () => {
      reflectorMock.getAllAndOverride.mockReturnValue(true);

      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      await expect(authGuard.canActivate(context)).resolves.toBe(true);
      expect(jwtServiceMock.verifyAsync).not.toHaveBeenCalled();
      expect(tokenServiceMock.rotateTokens).not.toHaveBeenCalled();
    });

    it('should allow request when JWT is valid', async () => {
      const payload = { sub: 'user-id', email: 'user@example.com' };
      const { context, request } = createHttpContext();

      jwtServiceMock.verifyAsync.mockResolvedValue(payload);

      await expect(authGuard.canActivate(context)).resolves.toBe(true);

      expect(jwtServiceMock.verifyAsync).toHaveBeenCalledWith('jwt-token');
      expect(request['user']).toEqual(payload);
      expect(request['refresh_token']).toBe('refresh-token');
      expect(tokenServiceMock.rotateTokens).not.toHaveBeenCalled();
    });

    it('should refresh tokens and allow request when JWT is expired and refresh token is valid', async () => {
      const cookieConfig = {
        jwtCookieConfig: { httpOnly: true },
        refreshCookieConfig: { httpOnly: true, path: '/auth' },
      };
      const rotateToken = {
        newJwtToken: 'new-jwt-token',
        newRefreshToken: 'new-refresh-token',
        user: { sub: 'user-id' },
      };
      const { context, request, response } = createHttpContext();

      jest.spyOn(console, 'log').mockImplementation(jest.fn());
      jwtServiceMock.verifyAsync.mockRejectedValue(
        new TokenExpiredError('jwt expired', new Date()),
      );
      cookieServiceMock.generateCookiesConfig.mockReturnValue(cookieConfig);
      tokenServiceMock.rotateTokens.mockResolvedValue(rotateToken);

      await expect(authGuard.canActivate(context)).resolves.toBe(true);

      expect(tokenServiceMock.rotateTokens).toHaveBeenCalledWith(
        'refresh-token',
      );
      expect(response.cookie).toHaveBeenCalledWith(
        'jwt_cookie',
        'new-jwt-token',
        cookieConfig.jwtCookieConfig,
      );
      expect(response.cookie).toHaveBeenCalledWith(
        'refresh_cookie',
        'new-refresh-token',
        cookieConfig.refreshCookieConfig,
      );
      expect(request['user']).toEqual(rotateToken.user);
      expect(request['refresh_token']).toBe('new-refresh-token');
    });

    it('should clear cookies and throw UnauthorizedException when JWT is expired and refresh token is invalid', async () => {
      const cookieConfig = {
        jwtCookieConfig: { httpOnly: true },
        refreshCookieConfig: { httpOnly: true, path: '/auth' },
      };
      const { context, response } = createHttpContext();

      jest.spyOn(console, 'log').mockImplementation(jest.fn());
      jest.spyOn(console, 'error').mockImplementation(jest.fn());
      jwtServiceMock.verifyAsync.mockRejectedValue(
        new TokenExpiredError('jwt expired', new Date()),
      );
      cookieServiceMock.generateCookiesConfig.mockReturnValue(cookieConfig);
      tokenServiceMock.rotateTokens.mockRejectedValue(
        new Error('invalid refresh token'),
      );

      await expect(authGuard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException('Session expired, please login again'),
      );

      expect(tokenServiceMock.rotateTokens).toHaveBeenCalledWith(
        'refresh-token',
      );
      expect(response.clearCookie).toHaveBeenCalledWith(
        'jwt_cookie',
        cookieConfig.jwtCookieConfig,
      );
      expect(response.clearCookie).toHaveBeenCalledWith(
        'refresh_token',
        cookieConfig.refreshCookieConfig,
      );
    });
  });

  describe('authGuard.extractTokenFromCookie', () => {
    it('should extract tokens from cookies when present', () => {
      const mockRequest = {
        cookies: {
          jwt_cookie: 'fake-jwt-token',
          refresh_cookie: 'fake-refresh-token',
        },
      };

      const result = authGuard['extractTokenFromCookie'](mockRequest);

      expect(result).toEqual({
        jwtCookie: 'fake-jwt-token',
        refreshTokenCookie: 'fake-refresh-token',
      });
    });

    it('should return nulls when cookies are missing', () => {
      const mockRequest = {
        cookies: {},
      };

      const result = authGuard['extractTokenFromCookie'](mockRequest);

      expect(result).toEqual({
        jwtCookie: null,
        refreshTokenCookie: null,
      });
    });

    it('should return nulls when cookies property is undefined', () => {
      const mockRequest = {};

      const result = authGuard['extractTokenFromCookie'](mockRequest);

      expect(result).toEqual({
        jwtCookie: null,
        refreshTokenCookie: null,
      });
    });
  });

  describe('authGuard.checkCookie', () => {
    it('should return true when both tokens are present', () => {
      const tokens = {
        jwtCookie: 'jwt',
        refreshTokenCookie: 'tokens',
      };

      const result = authGuard['checkCookie'](tokens);

      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException when token is missing', () => {
      const token = {
        jwtCookie: null,
        refreshTokenCookie: null,
      };

      expect(() => authGuard['checkCookie'](token)).toThrow(
        UnauthorizedException,
      );
    });
  });
});
