import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next(new AppError('Please log in to continue.', 401));
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    next(new AppError('Your session is invalid or has expired. Please log in again.', 401));
  }
}
