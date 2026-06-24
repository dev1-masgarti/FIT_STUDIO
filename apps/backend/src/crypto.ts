import crypto from 'node:crypto';

export const uid = (): string => crypto.randomUUID();

export const hashPassword = (password: string): { hash: string; salt: string } => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 120_000, 32, 'sha256').toString('hex');
  return { hash, salt };
};

export const verifyPassword = (password: string, hash: string, salt: string): boolean => {
  const computed = crypto.pbkdf2Sync(password, salt, 120_000, 32, 'sha256').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(computed));
};
