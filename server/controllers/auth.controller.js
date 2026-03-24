import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'name, email and password are required' });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: role || 'ANALYST' },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    const token = generateToken(user);
    return res.status(201).json({ success: true, data: { user, token } });
  } catch (err) { next(err); }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'email and password are required' });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    const token = generateToken(user);
    const { passwordHash, ...safeUser } = user;
    return res.json({ success: true, data: { user: safeUser, token } });
  } catch (err) { next(err); }
};

export const getMe = async (req, res, next) => {
  try {
    return res.json({ success: true, data: req.user });
  } catch (err) { next(err); }
};
