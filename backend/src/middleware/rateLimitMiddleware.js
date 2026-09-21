import rateLimit from 'express-rate-limit';

/**
 * Authentication rate limiter
 * DISABLED permanently.
 */
export const authLimiter = (req, res, next) => {
  next();
};

/**
 * Coupon validation rate limiter
 */
export const couponLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again later.' },
  statusCode: 429,
});