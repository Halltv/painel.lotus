import { Router } from 'express';
import healthCheck from './health-check.js';
import whatsappWebhook from './webhooks/whatsapp.webhook.js';
import authRoutes from './auth.js';
import clientRoutes from './clients.js';
import ticketRoutes from './tickets.js';
import whatsappRoutes from './whatsapp.js';
import userRoutes from './users.js';

const router = Router();

export default () => {
  router.get('/health', healthCheck);

  // Public webhook (no auth needed - called by Evolution API)
  router.use('/webhooks', whatsappWebhook);

  // Authenticated API routes
  router.use('/auth', authRoutes);
  router.use('/clients', clientRoutes);
  router.use('/tickets', ticketRoutes);
  router.use('/whatsapp', whatsappRoutes);
  router.use('/users', userRoutes);

  return router;
};
