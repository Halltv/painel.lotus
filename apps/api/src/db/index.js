import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import logger from '../utils/logger.js';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  logger.error('❌ DATABASE_URL não definida. Configure o arquivo .env na pasta apps/api/');
  process.exit(1);
}

logger.info('Conectando ao banco de dados PostgreSQL...');

const client = postgres(databaseUrl, {
  max: 10,               // pool de até 10 conexões
  idle_timeout: 30,      // fecha conexões ociosas após 30s
  connect_timeout: 15,   // timeout de conexão: 15s
  onnotice: () => {},    // silencia avisos do postgres
});

export const db = drizzle(client, { schema });

logger.info('✅ Drizzle ORM inicializado com sucesso.');

export default db;
