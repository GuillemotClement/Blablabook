import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt'; // Importe bien la classe !
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
