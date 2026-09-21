import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import asyncHandler from '../utils/asyncHandler.js';

const COOKIE_NAME = 'hp_auth';
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/** Attach JWT as an HttpOnly cookie and return user payload in body. */
function sendTokenCookie(res, user) {
  const payload = { id: user._id, name: user.name, email: user.email, role: user.role };
  res.cookie(COOKIE_NAME, generateToken(payload), COOKIE_OPTS);
  return payload;
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(String(email).trim())) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }

  if (String(password).length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  const exists = await User.exists({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ message: 'Email already registered' });

  const user = await User.create({ name, email, password, role: 'customer' });
  const payload = sendTokenCookie(res, user);
  res.status(201).json({ user: payload });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || '').toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password || ''))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  const payload = sendTokenCookie(res, user);
  res.json({ user: payload });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie(COOKIE_NAME, { ...COOKIE_OPTS, maxAge: 0 });
  res.json({ message: 'Logged out' });
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});
