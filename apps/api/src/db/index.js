import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import logger from '../utils/logger.js';

/**
 * Initialize PostgreSQL client
 * Uses DATABASE_URL environment variable or falls back to default local PostgreSQL connection
 * Format: postgresql://user:password@host:port/database
 */
const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/whatsapp_db';

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

logger.info('Initializing PostgreSQL connection...');

/**
 * Create postgres client
 * This client handles the actual database connection pooling and queries
 */
const client = postgres(databaseUrl);

/**
 * Initialize Drizzle ORM instance
 * Provides type-safe query builder and schema management
 * schema object includes all table definitions from schema.js
 */
export const db = drizzle(client, { schema });

logger.info('Drizzle ORM database instance initialized successfully');

export default db;
