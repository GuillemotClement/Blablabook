const JWT_SECRET_MIN_LENGTH = 32;

const FORBIDDEN_JWT_SECRETS = new Set([
  'mimix',
  'mimixlatrix',
  'CHANGE_ME_GENERATE_32_BYTES',
  'CHANGE_ME_GENERATE_A_RANDOM_32_BYTES_SECRET',
]);

export function getJwtSecret(): string {
  const jwtSecret = process.env.JWT_SECRET?.trim();

  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  if (FORBIDDEN_JWT_SECRETS.has(jwtSecret)) {
    throw new Error('JWT_SECRET must be changed from the default value');
  }

  if (jwtSecret.length < JWT_SECRET_MIN_LENGTH) {
    throw new Error(
      `JWT_SECRET must be at least ${JWT_SECRET_MIN_LENGTH} characters long`,
    );
  }

  return jwtSecret;
}
