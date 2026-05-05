import { Router } from 'express';
import { db } from '../db/index.js';
import { whatsappInstances, whatsappConversations, whatsappMessages } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import EvolutionApiService from '../services/evolutionApi.service.js';
import logger from '../utils/logger.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// Extrai mensagem legível de erro da Evolution (nunca retorna [object Object])
function extractEvolutionError(error) {
  if (error.evolutionData) {
    const d = error.evolutionData;
    return d.message || d.error || JSON.stringify(d);
  }
  return error.message || 'Erro desconhecido';
}

// GET /whatsapp/instances
router.get('/instances', async (req, res) => {
  try {
    const instances = await db.select().from(whatsappInstances).orderBy(desc(whatsappInstances.createdAt));
    res.json({ instances, count: instances.length });
  } catch (error) {
    logger.error('Get instances error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /whatsapp/instances
router.post('/instances', async (req, res) => {
  const { instanceName, evolutionApiKey, evolutionBaseUrl, webhookUrl } = req.body;

  if (!instanceName || !evolutionApiKey || !evolutionBaseUrl) {
    return res.status(400).json({ error: 'instanceName, evolutionApiKey e evolutionBaseUrl são obrigatórios' });
  }

  // Verifica se já existe no banco local
  const [existing] = await db
    .select()
    .from(whatsappInstances)
    .where(eq(whatsappInstances.instanceName, instanceName))
    .limit(1);

  if (existing) {
    // Instância já existe localmente — retorna sem tentar recriar na Evolution
    return res.status(200).json({
      instance: existing,
      qrCode: existing.qrCode,
      warning: 'Instância já existe no banco local. Status atual: ' + existing.status,
    });
  }

  try {
    const evolutionApi = new EvolutionApiService(evolutionApiKey, evolutionBaseUrl);
    const wh = webhookUrl || process.env.EVOLUTION_WEBHOOK_URL;

    let evolutionResponse;
    try {
      // v2: criar instância e configurar webhook separadamente
      evolutionResponse = await evolutionApi.createInstanceWithWebhook(instanceName, wh);
    } catch (evoErr) {
      const evoMsg = extractEvolutionError(evoErr);

      // Erro 403 = instância já existe na Evolution
      if (evoErr.status === 403 || evoMsg.toLowerCase().includes('already') || evoMsg.toLowerCase().includes('existe')) {
        logger.warn(`[EVO] Instance ${instanceName} already exists in Evolution, saving to DB anyway`);
        // Salva no banco com status connecting
        const [instance] = await db
          .insert(whatsappInstances)
          .values({ instanceName, evolutionApiKey, evolutionBaseUrl, status: 'connecting' })
          .returning();
        return res.status(200).json({
          instance,
          warning: `Instância já existia na Evolution API. Registrada localmente. Erro original: ${evoMsg}`,
        });
      }

      // Outros erros: retornar ao frontend de forma legível
      return res.status(evoErr.status || 500).json({
        error: `Erro na Evolution API: ${evoMsg}`,
      });
    }

    // Sucesso: salva no banco
    const qrCode = evolutionResponse?.qrcode?.base64 || evolutionResponse?.qrcode || null;
    const [instance] = await db
      .insert(whatsappInstances)
      .values({
        instanceName,
        evolutionApiKey,
        evolutionBaseUrl,
        status: 'connecting',
        qrCode,
      })
      .returning();

    logger.info(`Instance created and saved: ${instanceName}`);
    res.status(201).json({ instance, qrCode });

  } catch (error) {
    logger.error('Create instance unexpected error:', error.message);
    res.status(500).json({ error: extractEvolutionError(error) });
  }
});

// GET /whatsapp/instances/:id/qrcode
router.get('/instances/:id/qrcode', async (req, res) => {
  try {
    const [instance] = await db
      .select()
      .from(whatsappInstances)
      .where(eq(whatsappInstances.id, req.params.id))
      .limit(1);

    if (!instance) return res.status(404).json({ error: 'Instância não encontrada' });

    const evolutionApi = new EvolutionApiService(instance.evolutionApiKey, instance.evolutionBaseUrl);

    try {
      const qrResponse = await evolutionApi.getQrCode(instance.instanceName);
      const qrCode = qrResponse?.base64 || qrResponse?.qrcode?.base64 || qrResponse?.qrcode || null;

      // Salva QR atualizado no banco
      if (qrCode) {
        await db.update(whatsappInstances)
          .set({ qrCode, updatedAt: new Date() })
          .where(eq(whatsappInstances.id, instance.id));
      }

      res.json({ qrCode, status: instance.status });
    } catch (evoErr) {
      res.status(evoErr.status || 500).json({ error: extractEvolutionError(evoErr) });
    }
  } catch (error) {
    logger.error('Get QR code error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /whatsapp/instances/:id
router.delete('/instances/:id', async (req, res) => {
  try {
    const [instance] = await db
      .select()
      .from(whatsappInstances)
      .where(eq(whatsappInstances.id, req.params.id))
      .limit(1);

    if (!instance) return res.status(404).json({ error: 'Instância não encontrada' });

    const evolutionApi = new EvolutionApiService(instance.evolutionApiKey, instance.evolutionBaseUrl);

    // Tenta deletar na Evolution (ignora erros — pode já ter sido deletada)
    await evolutionApi.deleteInstance(instance.instanceName).catch(err => {
      logger.warn(`Could not delete from Evolution (non-fatal): ${err.message}`);
    });

    await db.delete(whatsappInstances).where(eq(whatsappInstances.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    logger.error('Delete instance error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /whatsapp/conversations
router.get('/conversations', async (req, res) => {
  try {
    const conversations = await db
      .select()
      .from(whatsappConversations)
      .orderBy(desc(whatsappConversations.updatedAt));
    res.json({ conversations, count: conversations.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /whatsapp/conversations/:id/messages
router.get('/conversations/:id/messages', async (req, res) => {
  try {
    const messages = await db
      .select()
      .from(whatsappMessages)
      .where(eq(whatsappMessages.conversationId, req.params.id))
      .orderBy(whatsappMessages.timestamp);
    res.json({ messages, count: messages.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /whatsapp/conversations/:id/send
router.post('/conversations/:id/send', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Texto da mensagem é obrigatório' });

  try {
    const [conversation] = await db
      .select()
      .from(whatsappConversations)
      .where(eq(whatsappConversations.id, req.params.id))
      .limit(1);

    if (!conversation) return res.status(404).json({ error: 'Conversa não encontrada' });

    const [instance] = await db
      .select()
      .from(whatsappInstances)
      .where(eq(whatsappInstances.id, conversation.instanceId))
      .limit(1);

    if (!instance) return res.status(404).json({ error: 'Instância não encontrada' });

    const evolutionApi = new EvolutionApiService(instance.evolutionApiKey, instance.evolutionBaseUrl);

    try {
      await evolutionApi.sendMessage(instance.instanceName, conversation.remoteJid, text);
    } catch (evoErr) {
      return res.status(evoErr.status || 500).json({ error: extractEvolutionError(evoErr) });
    }

    const [message] = await db
      .insert(whatsappMessages)
      .values({
        instanceId: instance.id,
        conversationId: conversation.id,
        remoteJid: conversation.remoteJid,
        messageText: text,
        messageType: 'text',
        sender: 'operator',
        timestamp: new Date(),
        isRead: true,
      })
      .returning();

    res.json({ message });
  } catch (error) {
    logger.error('Send message error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
