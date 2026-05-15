import { getJwtSecret } from './jwt.config';

describe('getJwtSecret', () => {
  const originalJwtSecret = process.env.JWT_SECRET;

  afterEach(() => {
    process.env.JWT_SECRET = originalJwtSecret;
  });

  it('should return a valid JWT secret', () => {
    process.env.JWT_SECRET = 'a-valid-jwt-secret-with-32-characters';

    expect(getJwtSecret()).toBe('a-valid-jwt-secret-with-32-characters');
  });

  it('should throw when JWT_SECRET is missing', () => {
    delete process.env.JWT_SECRET;

    expect(() => getJwtSecret()).toThrow(
      'JWT_SECRET environment variable is required',
    );
  });

  it('should throw when JWT_SECRET is a known default value', () => {
    process.env.JWT_SECRET = 'mimixlatrix';

    expect(() => getJwtSecret()).toThrow(
      'JWT_SECRET must be changed from the default value',
    );
  });

  it('should throw when JWT_SECRET is too short', () => {
    process.env.JWT_SECRET = 'too-short';

    expect(() => getJwtSecret()).toThrow(
      'JWT_SECRET must be at least 32 characters long',
    );
  });
});
