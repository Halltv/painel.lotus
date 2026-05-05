import { Router } from 'express';
import { db } from '../db/index.js';
import { clients } from '../db/schema.js';
import { eq, ilike, or } from 'drizzle-orm';
import logger from '../utils/logger.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// GET /clients
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let result;

    if (search) {
      result = await db
        .select()
        .from(clients)
        .where(or(ilike(clients.nome, `%${search}%`), ilike(clients.cnpj, `%${search}%`)));
    } else {
      result = await db.select().from(clients).orderBy(clients.nome);
    }

    // Convert numeric strings to numbers
    const formatted = result.map(c => ({
      ...c,
      valorTef: parseFloat(c.valorTef),
      custo: parseFloat(c.custo),
    }));

    res.json({ clients: formatted, count: formatted.length });
  } catch (error) {
    logger.error('Get clients error:', error.message);
    throw error;
  }
});

// GET /clients/:id
router.get('/:id', async (req, res) => {
  try {
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, req.params.id))
      .limit(1);

    if (!client) return res.status(404).json({ error: 'Cliente não encontrado' });

    res.json({
      ...client,
      valorTef: parseFloat(client.valorTef),
      custo: parseFloat(client.custo),
    });
  } catch (error) {
    logger.error('Get client error:', error.message);
    throw error;
  }
});

// POST /clients
router.post('/', requireRole('ADMIN', 'GERENTE'), async (req, res) => {
  const { nome, cnpj, email, whatsapp, tipoTef, status, valorTef, custo } = req.body;

  if (!nome || !cnpj || !email || !whatsapp || !tipoTef) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  }

  try {
    const [client] = await db
      .insert(clients)
      .values({ nome, cnpj, email, whatsapp, tipoTef, status: status || 'ativo', valorTef: valorTef || 0, custo: custo || 0 })
      .returning();

    logger.info(`Client created: ${client.id}`);
    res.status(201).json({ ...client, valorTef: parseFloat(client.valorTef), custo: parseFloat(client.custo) });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'CNPJ já cadastrado' });
    }
    logger.error('Create client error:', error.message);
    throw error;
  }
});

// PUT /clients/:id
router.put('/:id', requireRole('ADMIN', 'GERENTE'), async (req, res) => {
  const { nome, cnpj, email, whatsapp, tipoTef, status, valorTef, custo } = req.body;

  try {
    const [client] = await db
      .update(clients)
      .set({ nome, cnpj, email, whatsapp, tipoTef, status, valorTef, custo, updatedAt: new Date() })
      .where(eq(clients.id, req.params.id))
      .returning();

    if (!client) return res.status(404).json({ error: 'Cliente não encontrado' });

    res.json({ ...client, valorTef: parseFloat(client.valorTef), custo: parseFloat(client.custo) });
  } catch (error) {
    logger.error('Update client error:', error.message);
    throw error;
  }
});

// DELETE /clients/:id
router.delete('/:id', requireRole('ADMIN'), async (req, res) => {
  try {
    const [client] = await db
      .delete(clients)
      .where(eq(clients.id, req.params.id))
      .returning({ id: clients.id });

    if (!client) return res.status(404).json({ error: 'Cliente não encontrado' });

    res.json({ success: true });
  } catch (error) {
    logger.error('Delete client error:', error.message);
    throw error;
  }
});

export default router;
