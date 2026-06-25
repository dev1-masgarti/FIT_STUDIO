import jwt from 'jsonwebtoken';
import type { FastifyReply, FastifyRequest } from 'fastify';

const JWT_SECRET = process.env.BACKEND_JWT_SECRET ?? 'dev-only-change-me';
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

export type AuthTokenPayload = {
  sub: string;
  email: string;
};

export const signAccessToken = (userId: string, email: string): string =>
  jwt.sign({ sub: userId, email }, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: TOKEN_TTL_SECONDS,
  });

export const verifyAccessToken = (token: string): AuthTokenPayload => {
  const decoded = jwt.verify(token, JWT_SECRET);
  if (!decoded || typeof decoded !== 'object') {
    throw new Error('Invalid token');
  }
  const sub = decoded.sub;
  const email = (decoded as { email?: unknown }).email;
  if (typeof sub !== 'string' || typeof email !== 'string') {
    throw new Error('Invalid token payload');
  }
  return { sub, email };
};

export const tryVerifyAccessToken = (token: string): AuthTokenPayload | null => {
  try {
    return verifyAccessToken(token);
  } catch {
    return null;
  }
};

export const getBearerToken = (request: FastifyRequest): string | null => {
  const value = request.headers.authorization;
  if (!value || !value.startsWith('Bearer ')) return null;
  return value.slice('Bearer '.length).trim();
};

export const unauthorized = (reply: FastifyReply, message = 'Unauthorized') =>
  reply.status(401).send({ error: message });
