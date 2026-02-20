import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
});

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
  email: z.string().email(),
});

const JWT_SECRET = process.env.JWT_SECRET || 'vantacore-secret-key-change-in-production';

interface TokenPayload {
  userId: string;
  username: string;
  role: string;
}

router.post('/login', async (req, res) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    await db.read();
    const user = db.data.users.find(u => u.username === username);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    const userIndex = db.data.users.findIndex(u => u.id === user.id);
    db.data.users[userIndex].lastLogin = new Date().toISOString();
    await db.write();

    const tokenPayload: TokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = registerSchema.parse(req.body);

    await db.read();
    
    const existingUser = db.data.users.find(u => u.username === username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: uuidv4(),
      username,
      password: hashedPassword,
      email,
      role: 'user' as const,
      createdAt: new Date().toISOString(),
      lastLogin: null,
    };

    db.data.users.push(newUser);
    await db.write();

    const tokenPayload: TokenPayload = {
      userId: newUser.id,
      username: newUser.username,
      role: newUser.role,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    await db.read();
    const user = db.data.users.find(u => u.id === decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/change-password', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    const { currentPassword, newPassword } = z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(6).max(100),
    }).parse(req.body);

    await db.read();
    const user = db.data.users.find(u => u.id === decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const userIndex = db.data.users.findIndex(u => u.id === user.id);
    db.data.users[userIndex].password = hashedPassword;
    await db.write();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
