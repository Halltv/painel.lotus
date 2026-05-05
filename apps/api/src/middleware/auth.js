import { db } from '../db/index.js';
import { sessions, users } from '../db/schema.js';
import { eq, gt } from 'drizzle-orm';
import logger from '../utils/logger.js';

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  }

  const token = authHeader.substring(7);

  try {
    const [session] = await db
      .select({ 
        id: sessions.id, 
        userId: sessions.userId, 
        expiresAt: sessions.expiresAt 
      })
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (!session) {
      return res.status(401).json({ error: 'Sessão inválida ou expirada' });
    }

    if (new Date() > session.expiresAt) {
      await db.delete(sessions).where(eq(sessions.id, session.id));
      return res.status(401).json({ error: 'Sessão expirada, faça login novamente' });
    }

    const [user] = await db
      .select({ 
        id: users.id, 
        name: users.name, 
        email: users.email, 
        role: users.role, 
        avatar: users.avatar,
        active: users.active // 🔥 CORREÇÃO DAQUI: AGORA ELE BUSCA O STATUS DE ATIVO!
      })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user || !user.active) {
      return res.status(401).json({ error: 'Usuário não encontrado ou inativo' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error.message);
    return res.status(500).json({ error: 'Erro interno de autenticação' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    const userRole = String(req.user.role).toUpperCase();
    const allowedRoles = roles.map(r => String(r).toUpperCase());

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Sem permissão para esta ação' });
    }
    next();
  };
}