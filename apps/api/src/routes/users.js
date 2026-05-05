import { Router } from 'express';
import { createHash, randomBytes } from 'crypto';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import logger from '../utils/logger.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(password + salt).digest('hex');
  return `${salt}:${hash}`;
}

// GET /users  (admin only)
router.get('/', requireRole('ADMIN'), async (req, res) => {
  try {
    const result = await db
      .select({ id: users.id, name: users.name, email: users.email, role: users.role, avatar: users.avatar, active: users.active, createdAt: users.createdAt })
      .from(users)
      .orderBy(users.name);
    res.json({ users: result, count: result.length });
  } catch (error) {
    logger.error('Get users error:', error.message);
    throw error;
  }
});

// POST /users  (admin only)
router.post('/', requireRole('ADMIN'), async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
  }

  try {
    const [user] = await db
      .insert(users)
      .values({ name, email: email.toLowerCase(), passwordHash: hashPassword(password), role: role || 'OPERADOR', avatar: name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2) })
      .returning({ id: users.id, name: users.name, email: users.email, role: users.role, avatar: users.avatar });

    res.status(201).json(user);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }
    logger.error('Create user error:', error.message);
    throw error;
  }
});

// PUT /users/:id/profile  (self or admin)
router.put('/:id/profile', async (req, res) => {
  if (req.user.id !== req.params.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Sem permissão' });
  }

  const { name } = req.body;

  try {
    const [user] = await db
      .update(users)
      .set({ name, updatedAt: new Date() })
      .where(eq(users.id, req.params.id))
      .returning({ id: users.id, name: users.name, email: users.email, role: users.role, avatar: users.avatar });

    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user);
  } catch (error) {
    logger.error('Update user error:', error.message);
    throw error;
  }
});

// DELETE /users/:id  (admin only)
router.delete('/:id', requireRole('ADMIN'), async (req, res) => {
  if (req.user.id === req.params.id) {
    return res.status(400).json({ error: 'Não é possível excluir sua própria conta' });
  }

  try {
    await db.update(users).set({ active: false }).where(eq(users.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    logger.error('Delete user error:', error.message);
    throw error;
  }
});

export default router;
