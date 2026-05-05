import { Router } from 'express';
import { db } from '../db/index.js';
import { tickets, ticketActivities } from '../db/schema.js';
import { eq, ilike, or, and, desc } from 'drizzle-orm';
import logger from '../utils/logger.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

function generateTicketId() {
  return `T-${Math.floor(Math.random() * 9000) + 1000}`;
}

// GET /tickets
router.get('/', async (req, res) => {
  try {
    const { search, status, urgencia } = req.query;

    let query = db.select().from(tickets);
    const conditions = [];

    if (search) {
      conditions.push(
        or(ilike(tickets.titulo, `%${search}%`), ilike(tickets.clientName, `%${search}%`))
      );
    }
    if (status && status !== 'todos') {
      conditions.push(eq(tickets.status, status));
    }
    if (urgencia && urgencia !== 'todas') {
      conditions.push(eq(tickets.urgencia, urgencia));
    }

    const result = await db
      .select()
      .from(tickets)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(tickets.createdAt));

    res.json({ tickets: result, count: result.length });
  } catch (error) {
    logger.error('Get tickets error:', error.message);
    throw error;
  }
});

// GET /tickets/:id
router.get('/:id', async (req, res) => {
  try {
    const [ticket] = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, req.params.id))
      .limit(1);

    if (!ticket) return res.status(404).json({ error: 'Chamado não encontrado' });

    const activities = await db
      .select()
      .from(ticketActivities)
      .where(eq(ticketActivities.ticketId, ticket.id))
      .orderBy(desc(ticketActivities.createdAt));

    res.json({ ...ticket, activities });
  } catch (error) {
    logger.error('Get ticket error:', error.message);
    throw error;
  }
});

// POST /tickets
router.post('/', async (req, res) => {
  const { titulo, descricao, clientId, clientName, urgencia, status, categoria, atribuidoA, tags } = req.body;

  if (!titulo || !descricao) {
    return res.status(400).json({ error: 'Título e descrição são obrigatórios' });
  }

  try {
    const [ticket] = await db
      .insert(tickets)
      .values({
        titulo,
        descricao,
        clientId: clientId || null,
        clientName: clientName || null,
        urgencia: urgencia || 'Média',
        status: status || 'A Fazer',
        categoria: categoria || 'Suporte',
        atribuidoA: atribuidoA || null,
        tags: tags || [],
        createdBy: req.user.id,
      })
      .returning();

    await db.insert(ticketActivities).values({
      ticketId: ticket.id,
      tipo: 'criacao',
      usuario: req.user.name,
      acao: 'Chamado criado',
      detalhes: `Chamado aberto por ${req.user.name}`,
    });

    logger.info(`Ticket created: ${ticket.id}`);
    res.status(201).json(ticket);
  } catch (error) {
    logger.error('Create ticket error:', error.message);
    throw error;
  }
});

// PUT /tickets/:id
router.put('/:id', async (req, res) => {
  const { titulo, descricao, clientId, clientName, urgencia, status, categoria, atribuidoA, parecerTecnico, tags, tempoGasto } = req.body;

  try {
    const [existing] = await db.select().from(tickets).where(eq(tickets.id, req.params.id)).limit(1);
    if (!existing) return res.status(404).json({ error: 'Chamado não encontrado' });

    const [ticket] = await db
      .update(tickets)
      .set({
        titulo, descricao, clientId, clientName, urgencia, status, categoria,
        atribuidoA, parecerTecnico, tags, tempoGasto,
        updatedAt: new Date(),
      })
      .where(eq(tickets.id, req.params.id))
      .returning();

    // Log status change
    if (existing.status !== status) {
      await db.insert(ticketActivities).values({
        ticketId: ticket.id,
        tipo: 'status',
        usuario: req.user.name,
        acao: 'Status alterado',
        detalhes: `Status alterado de "${existing.status}" para "${status}"`,
      });
    }

    // Log assignment change
    if (existing.atribuidoA !== atribuidoA) {
      await db.insert(ticketActivities).values({
        ticketId: ticket.id,
        tipo: 'atribuicao',
        usuario: req.user.name,
        acao: 'Atribuição alterada',
        detalhes: `Atribuído para ${atribuidoA || 'Não Atribuído'}`,
      });
    }

    // Log technical note
    if (parecerTecnico && existing.parecerTecnico !== parecerTecnico) {
      await db.insert(ticketActivities).values({
        ticketId: ticket.id,
        tipo: 'parecer',
        usuario: req.user.name,
        acao: 'Parecer técnico adicionado',
        detalhes: 'Parecer técnico atualizado',
      });
    }

    res.json(ticket);
  } catch (error) {
    logger.error('Update ticket error:', error.message);
    throw error;
  }
});

// PATCH /tickets/:id/status  (for kanban drag & drop)
router.patch('/:id/status', async (req, res) => {
  const { status, urgencia } = req.body;

  try {
    const [existing] = await db.select().from(tickets).where(eq(tickets.id, req.params.id)).limit(1);
    if (!existing) return res.status(404).json({ error: 'Chamado não encontrado' });

    const updates = { updatedAt: new Date() };
    if (status) updates.status = status;
    if (urgencia) updates.urgencia = urgencia;

    const [ticket] = await db
      .update(tickets)
      .set(updates)
      .where(eq(tickets.id, req.params.id))
      .returning();

    if (status && existing.status !== status) {
      await db.insert(ticketActivities).values({
        ticketId: ticket.id,
        tipo: 'status',
        usuario: req.user.name,
        acao: 'Status alterado via Kanban',
        detalhes: `Status alterado de "${existing.status}" para "${status}"`,
      });
    }

    res.json(ticket);
  } catch (error) {
    logger.error('Patch ticket status error:', error.message);
    throw error;
  }
});

// DELETE /tickets/:id
router.delete('/:id', async (req, res) => {
  try {
    const [ticket] = await db
      .delete(tickets)
      .where(eq(tickets.id, req.params.id))
      .returning({ id: tickets.id });

    if (!ticket) return res.status(404).json({ error: 'Chamado não encontrado' });

    res.json({ success: true });
  } catch (error) {
    logger.error('Delete ticket error:', error.message);
    throw error;
  }
});

export default router;
