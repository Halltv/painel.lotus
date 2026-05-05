import 'dotenv/config';
import { publicProcedure, router } from '../trpc.js';
import { z } from 'zod';
import { db } from '../../db/index.js';
import { whatsappInstances } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import EvolutionApiService from '../../services/evolutionApi.service.js';
import logger from '../../utils/logger.js';

export const whatsappRouter = router({
  /**
   * Create a new WhatsApp instance
   * Initializes instance in Evolution API and saves to database
   */
  createInstance: publicProcedure
    .input(
      z.object({
        instanceName: z.string().min(1, 'Instance name is required'),
        evolutionApiKey: z.string().min(1, 'Evolution API key is required'),
        evolutionBaseUrl: z.string().url('Invalid Evolution base URL'),
        webhookUrl: z.string().url('Invalid webhook URL'),
      })
    )
    .mutation(async ({ input }) => {
      const { instanceName, evolutionApiKey, evolutionBaseUrl, webhookUrl } = input;

      logger.info(`Creating WhatsApp instance: ${instanceName}`);

      // Initialize Evolution API service
      const evolutionApi = new EvolutionApiService(evolutionApiKey, evolutionBaseUrl);

      // Create instance in Evolution API
      const evolutionResponse = await evolutionApi.createInstance(instanceName, webhookUrl);

      if (!evolutionResponse.instance) {
        throw new Error('Failed to create instance in Evolution API');
      }

      // Save instance to database
      const dbInstance = await db
        .insert(whatsappInstances)
        .values({
          instanceName,
          evolutionApiKey,
          evolutionBaseUrl,
          status: 'connecting',
          qrCode: evolutionResponse.qrcode || null,
        })
        .returning();

      logger.info(`WhatsApp instance created successfully: ${instanceName}`);

      return {
        success: true,
        instance: dbInstance[0],
        qrCode: evolutionResponse.qrcode,
      };
    }),

  /**
   * Get QR code for an instance
   */
  getQrCode: publicProcedure
    .input(
      z.object({
        instanceId: z.string().uuid('Invalid instance ID'),
      })
    )
    .query(async ({ input }) => {
      const { instanceId } = input;

      logger.info(`Fetching QR code for instance: ${instanceId}`);

      // Get instance from database
      const instance = await db
        .select()
        .from(whatsappInstances)
        .where(eq(whatsappInstances.id, instanceId))
        .limit(1);

      if (!instance || instance.length === 0) {
        throw new Error('Instance not found');
      }

      const instanceData = instance[0];

      // Fetch QR code from Evolution API
      const evolutionApi = new EvolutionApiService(
        instanceData.evolutionApiKey,
        instanceData.evolutionBaseUrl
      );

      const qrResponse = await evolutionApi.getQrCode(instanceData.instanceName);

      return {
        instanceId,
        qrCode: qrResponse.qrcode,
        status: instanceData.status,
      };
    }),

  /**
   * Get instance status and phone number
   */
  getInstanceStatus: publicProcedure
    .input(
      z.object({
        instanceId: z.string().uuid('Invalid instance ID'),
      })
    )
    .query(async ({ input }) => {
      const { instanceId } = input;

      logger.info(`Fetching status for instance: ${instanceId}`);

      // Get instance from database
      const instance = await db
        .select()
        .from(whatsappInstances)
        .where(eq(whatsappInstances.id, instanceId))
        .limit(1);

      if (!instance || instance.length === 0) {
        throw new Error('Instance not found');
      }

      const instanceData = instance[0];

      // Fetch status from Evolution API
      const evolutionApi = new EvolutionApiService(
        instanceData.evolutionApiKey,
        instanceData.evolutionBaseUrl
      );

      const statusResponse = await evolutionApi.getInstanceStatus(instanceData.instanceName);

      return {
        instanceId,
        instanceName: instanceData.instanceName,
        status: instanceData.status,
        phoneNumber: instanceData.phoneNumber,
        evolutionStatus: statusResponse,
      };
    }),

  /**
   * List all WhatsApp instances
   */
  listInstances: publicProcedure.query(async () => {
    logger.info('Fetching all WhatsApp instances');

    const instances = await db.select().from(whatsappInstances);

    return {
      success: true,
      instances,
      count: instances.length,
    };
  }),

  /**
   * Disconnect a WhatsApp instance
   */
  disconnectInstance: publicProcedure
    .input(
      z.object({
        instanceId: z.string().uuid('Invalid instance ID'),
      })
    )
    .mutation(async ({ input }) => {
      const { instanceId } = input;

      logger.info(`Disconnecting instance: ${instanceId}`);

      // Get instance from database
      const instance = await db
        .select()
        .from(whatsappInstances)
        .where(eq(whatsappInstances.id, instanceId))
        .limit(1);

      if (!instance || instance.length === 0) {
        throw new Error('Instance not found');
      }

      const instanceData = instance[0];

      // Disconnect from Evolution API
      const evolutionApi = new EvolutionApiService(
        instanceData.evolutionApiKey,
        instanceData.evolutionBaseUrl
      );

      await evolutionApi.disconnectInstance(instanceData.instanceName);

      // Update instance status in database
      const updated = await db
        .update(whatsappInstances)
        .set({
          status: 'disconnected',
          updatedAt: new Date(),
        })
        .where(eq(whatsappInstances.id, instanceId))
        .returning();

      logger.info(`Instance disconnected: ${instanceId}`);

      return {
        success: true,
        instance: updated[0],
      };
    }),
});
