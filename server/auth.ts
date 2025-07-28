import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { type Request, type Response, type NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export interface JWTPayload {
  userId: string;
  email: string;
}

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // In SKIP_AUTH mode, use session-based authentication (from Replit Auth)
  if (process.env.SKIP_AUTH === 'true') {
    if ((req as any).user && (req as any).user.id) {
      return next();
    }
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Production mode - use JWT authentication
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const payload = verifyToken(token);
    (req as any).user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Alias for compatibility
export const isAuthenticated = authenticateToken;

// Setup auth placeholder (no session needed for JWT)
export const setupAuth = (app: any) => {
  // JWT doesn't need session setup like Replit Auth
  console.log('🔐 JWT Authentication configured');
};