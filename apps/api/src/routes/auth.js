import { Router } from 'express';
import { createHash, randomBytes } from 'crypto';
import { db } from '../db/index.js';
import { users, sessions } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import logger from '../utils/logger.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(password + salt).digest('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const attempt = createHash('sha256').update(password + salt).digest('hex');
  return attempt === hash;
}

function generateToken() {
  return randomBytes(48).toString('hex');
}

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    if (!user.active) {
      return res.status(403).json({ error: 'Usuário inativo' });
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

    await db.insert(sessions).values({ userId: user.id, token, expiresAt });

    logger.info(`User logged in: ${user.email}`);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    logger.error('Login error:', error.message);
    throw error;
  }
});

// POST /auth/logout
router.post('/logout', authMiddleware, async (req, res) => {
  const token = req.headers.authorization.substring(7);
  try {
    await db.delete(sessions).where(eq(sessions.token, token));
    res.json({ success: true });
  } catch (error) {
    logger.error('Logout error:', error.message);
    throw error;
  }
});

// GET /auth/me
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

export default router;