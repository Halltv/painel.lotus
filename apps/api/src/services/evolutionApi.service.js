import 'dotenv/config';
import axios from 'axios';
import logger from '../utils/logger.js';

/**
 * Evolution API v2 Service
 *
 * Mudanças da v2 vs v1:
 * - createInstance: NÃO aceita webhook no body de criação
 * - Webhook configurado separadamente via POST /webhook/set/:instanceName
 * - Auth: enviar ambos `apikey` e `Authorization: Bearer` para compatibilidade
 */
class EvolutionApiService {
  constructor(apiKey, baseUrl) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, ''); // remove trailing slash
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`, // v2 requer ambos
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });

    // Log erros detalhados da Evolution
    this.client.interceptors.response.use(
      (res) => res,
      (err) => {
        const detail = err.response?.data;
        logger.error(`Evolution API error [${err.response?.status}]:`, JSON.stringify(detail));
        // Re-throw com mensagem legível
        const msg = detail?.message || detail?.error || err.message || 'Erro na Evolution API';
        const friendly = Array.isArray(msg) ? msg.join(', ') : String(msg);
        const error = new Error(friendly);
        error.status = err.response?.status;
        error.evolutionData = detail;
        throw error;
      }
    );
  }

  /**
   * Passo 1: Criar instância (SEM webhook no body — v2)
   */
  async createInstance(instanceName) {
    logger.info(`[EVO v2] Creating instance: ${instanceName}`);
    const response = await this.client.post('/instance/create', {
      instanceName,
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS',
    });
    logger.info(`[EVO v2] Instance created: ${instanceName}`);
    return response.data;
  }

  /**
   * Passo 2: Configurar webhook separadamente (v2 obrigatório separar)
   */
  async setWebhook(instanceName, webhookUrl) {
    if (!webhookUrl) {
      logger.warn(`[EVO v2] No webhook URL provided for ${instanceName}, skipping`);
      return null;
    }
    logger.info(`[EVO v2] Setting webhook for ${instanceName}: ${webhookUrl}`);
    const response = await this.client.post(`/webhook/set/${instanceName}`, {
      webhook: {
        enabled: true,
        url: webhookUrl,
        webhookByEvents: false,
        webhookBase64: false,
        events: [
          'MESSAGES_UPSERT',
          'MESSAGES_UPDATE',
          'CONNECTION_UPDATE',
          'QRCODE_UPDATED',
        ],
      },
    });
    logger.info(`[EVO v2] Webhook configured for ${instanceName}`);
    return response.data;
  }

  /**
   * Criar instância + configurar webhook em sequência (v2)
   */
  async createInstanceWithWebhook(instanceName, webhookUrl) {
    const instanceData = await this.createInstance(instanceName);
    if (webhookUrl) {
      await this.setWebhook(instanceName, webhookUrl).catch(err => {
        logger.warn(`[EVO v2] Webhook setup failed (non-fatal): ${err.message}`);
      });
    }
    return instanceData;
  }

  async getQrCode(instanceName) {
    logger.info(`[EVO v2] Fetching QR code for: ${instanceName}`);
    const response = await this.client.get(`/instance/connect/${instanceName}`);
    return response.data;
  }

  async getInstanceStatus(instanceName) {
    logger.info(`[EVO v2] Fetching status for: ${instanceName}`);
    const response = await this.client.get(`/instance/fetchInstances`, {
      params: { instanceName },
    });
    return response.data;
  }

  async sendMessage(instanceName, remoteJid, text) {
    logger.info(`[EVO v2] Sending text to ${remoteJid} via ${instanceName}`);
    const response = await this.client.post(`/message/sendText/${instanceName}`, {
      number: remoteJid,
      text,
    });
    return response.data;
  }

  async sendMedia(instanceName, remoteJid, mediaUrl, mediaType, caption) {
    logger.info(`[EVO v2] Sending media to ${remoteJid}`);
    const response = await this.client.post(`/message/sendMedia/${instanceName}`, {
      number: remoteJid,
      mediatype: mediaType,
      media: mediaUrl,
      caption,
    });
    return response.data;
  }

  async disconnectInstance(instanceName) {
    logger.info(`[EVO v2] Disconnecting: ${instanceName}`);
    const response = await this.client.delete(`/instance/logout/${instanceName}`);
    return response.data;
  }

  async deleteInstance(instanceName) {
    logger.info(`[EVO v2] Deleting: ${instanceName}`);
    const response = await this.client.delete(`/instance/delete/${instanceName}`);
    return response.data;
  }

  async getContacts(instanceName) {
    const response = await this.client.get(`/chat/findContacts/${instanceName}`);
    return response.data;
  }

  async getMessages(instanceName, remoteJid, limit = 20) {
    const response = await this.client.post(`/chat/findMessages/${instanceName}`, {
      where: { key: { remoteJid } },
      limit,
    });
    return response.data;
  }
}

export default EvolutionApiService;
