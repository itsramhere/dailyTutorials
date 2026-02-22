import jwt from 'jsonwebtoken';
import { AppError } from './customErrors';

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface TokenPayload {
  id: string;
  email: string;
  role?: string;
}

export function generateToken(payload: TokenPayload): string {
  if (!JWT_SECRET) {
    throw new AppError("JWT_SECRET is missing in environment variables", 401);
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}