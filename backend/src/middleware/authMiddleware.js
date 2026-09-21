import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const COOKIE_NAME = 'hp_auth';

/**
 * Verify JWT from HttpOnly cookie (primary) or Bearer header (fallback for
 * tools like Postman / admin panel that still send Authorization header).
 */
export function protect(req, res, next) {
  const cookieToken  = req.cookies?.[COOKIE_NAME];
  const headerToken  = (req.headers.authorization || '').startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;

  const token = cookieToken || headerToken;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    req.user = jwt.verify(token, env.jwt);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}
