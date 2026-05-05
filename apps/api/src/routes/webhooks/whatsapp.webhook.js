import 'dotenv/config';
import express from 'express';
import { db } from '../../db/index.js';
import { whatsappInstances, whatsappMessages, whatsappConversations } from '../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import EvolutionApiService from '../../services/evolutionApi.service.js';
import { processChatbotMessage, STATES } from '../../services/chatbot.service.js';
import logger from '../../utils/logger.js';

const router = express.Router();

async function handleMessageUpsert(instanceName, data) {
  const { messages } = data;
  if (!messages || messages.length === 0) return;

  const [instance] = await db
    .select()
    .from(whatsappInstances)
    .where(eq(whatsappInstances.instanceName, instanceName))
    .limit(1);

  if (!instance) {
    logger.warn(`Instance not found: ${instanceName}`);
    return;
  }

  for (const message of messages) {
    const { key, message: messageContent, pushName } = message;
    const { remoteJid, fromMe } = key;

    if (fromMe) continue;
    if (remoteJid.includes('@g.us')) continue; // skip group messages for now

    // Extract message text and type
    let messageText = '';
    let messageType = 'text';
    let mediaUrl = null;

    if (messageContent?.conversation) {
      messageText = messageContent.conversation;
    } else if (messageContent?.extendedTextMessage?.text) {
      messageText = messageContent.extendedTextMessage.text;
    } else if (messageContent?.imageMessage) {
      messageType = 'image';
      mediaUrl = messageContent.imageMessage.url;
      messageText = messageContent.imageMessage.caption || '';
    } else if (messageContent?.videoMessage) {
      messageType = 'video';
      mediaUrl = messageContent.videoMessage.url;
      messageText = messageContent.videoMessage.caption || '';
    } else if (messageContent?.audioMessage) {
      messageType = 'audio';
      mediaUrl = messageContent.audioMessage.url;
    } else if (messageContent?.documentMessage) {
      messageType = 'document';
      mediaUrl = messageContent.documentMessage.url;
      messageText = messageContent.documentMessage.fileName || '';
    }

    // Get or create conversation
    let [conversation] = await db
      .select()
      .from(whatsappConversations)
      .where(
        and(
          eq(whatsappConversations.instanceId, instance.id),
          eq(whatsappConversations.remoteJid, remoteJid)
        )
      )
      .limit(1);

    if (!conversation) {
      [conversation] = await db
        .insert(whatsappConversations)
        .values({
          instanceId: instance.id,
          remoteJid,
          contactName: pushName || remoteJid.split('@')[0],
          status: 'active',
          currentState: STATES.INITIAL,
        })
        .returning();
    } else if (conversation.status === 'closed') {
      // Reopen closed conversation
      await db
        .update(whatsappConversations)
        .set({ status: 'active', currentState: STATES.INITIAL, updatedAt: new Date() })
        .where(eq(whatsappConversations.id, conversation.id));
      conversation.currentState = STATES.INITIAL;
    }

    // Save incoming message
    await db.insert(whatsappMessages).values({
      instanceId: instance.id,
      conversationId: conversation.id,
      remoteJid,
      messageText,
      messageType,
      sender: 'user',
      mediaUrl,
      timestamp: new Date(message.messageTimestamp * 1000),
      isRead: false,
    });

    logger.info(`Message saved for ${remoteJid}`);

    // Process with chatbot if not transferred to human
    if (conversation.status !== 'transferred' && messageText) {
      const { response, nextState, transferToHuman } = processChatbotMessage(
        conversation.currentState || STATES.INITIAL,
        messageText
      );

      // Update conversation state
      const updateData = { currentState: nextState, updatedAt: new Date() };
      if (transferToHuman) {
        updateData.status = 'transferred';
        updateData.transferredToHumanAt = new Date();
      }

      await db
        .update(whatsappConversations)
        .set(updateData)
        .where(eq(whatsappConversations.id, conversation.id));

      // Send bot response
      try {
        const evolutionApi = new EvolutionApiService(instance.evolutionApiKey, instance.evolutionBaseUrl);
        await evolutionApi.sendMessage(instance.instanceName, remoteJid, response);

        // Save bot response as message
        await db.insert(whatsappMessages).values({
          instanceId: instance.id,
          conversationId: conversation.id,
          remoteJid,
          messageText: response,
          messageType: 'text',
          sender: 'bot',
          timestamp: new Date(),
          isRead: true,
        });

        logger.info(`Bot responded to ${remoteJid} (state: ${nextState})`);
      } catch (err) {
        logger.error(`Failed to send bot response: ${err.message}`);
      }
    }
  }
}

async function handleConnectionUpdate(instanceName, data) {
  const { connection, qr } = data;

  let status = 'disconnected';
  if (connection === 'open') status = 'connected';
  else if (connection === 'connecting') status = 'connecting';

  try {
    await db
      .update(whatsappInstances)
      .set({ status, qrCode: qr || null, updatedAt: new Date() })
      .where(eq(whatsappInstances.instanceName, instanceName));

    logger.info(`Instance ${instanceName} status: ${status}`);
  } catch (error) {
    logger.error(`Failed to update instance status: ${error.message}`);
  }
}

async function handleMessageUpdate(instanceName, data) {
  // Mark messages as read when status updates come in
  const updates = Array.isArray(data) ? data : [data];

  for (const update of updates) {
    if (update?.status === 'READ' && update?.key?.remoteJid) {
      const [instance] = await db
        .select({ id: whatsappInstances.id })
        .from(whatsappInstances)
        .where(eq(whatsappInstances.instanceName, instanceName))
        .limit(1);

      if (instance) {
        await db
          .update(whatsappMessages)
          .set({ isRead: true })
          .where(
            and(
              eq(whatsappMessages.instanceId, instance.id),
              eq(whatsappMessages.remoteJid, update.key.remoteJid)
            )
          );
      }
    }
  }
}

router.post('/whatsapp/webhook', async (req, res) => {
  const { event, instance, data } = req.body;

  logger.info(`Webhook: ${event} from ${instance}`);

  if (!event || !instance) {
    return res.status(400).json({ error: 'Missing event or instance' });
  }

  try {
    switch (event) {
      case 'MESSAGES_UPSERT':
        await handleMessageUpsert(instance, data);
        break;
      case 'CONNECTION_UPDATE':
        await handleConnectionUpdate(instance, data);
        break;
      case 'MESSAGES_UPDATE':
        await handleMessageUpdate(instance, data);
        break;
      default:
        logger.warn(`Unknown event: ${event}`);
    }

    res.json({ success: true, event, instance });
  } catch (error) {
    logger.error(`Webhook error: ${error.message}`);
    throw error;
  }
});

export default router;
