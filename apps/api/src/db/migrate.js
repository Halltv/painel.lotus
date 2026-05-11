import 'dotenv/config';
import postgres from 'postgres';
import logger from '../utils/logger.js';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/whatsapp_db';

const sql = postgres(databaseUrl);

async function migrate() {
  logger.info('Running database migrations...');

  // Enums — cada um separado
  await sql`DO $$ BEGIN CREATE TYPE user_role AS ENUM ('ADMIN', 'GERENTE', 'OPERADOR'); EXCEPTION WHEN duplicate_object THEN null; END $$`;
  await sql`DO $$ BEGIN CREATE TYPE client_status AS ENUM ('ativo', 'implantacao', 'bloqueado', 'inativo'); EXCEPTION WHEN duplicate_object THEN null; END $$`;
  await sql`DO $$ BEGIN CREATE TYPE tipo_tef AS ENUM ('tef_integrado', 'tef_maquininha_wireless', 'automacao_pdv'); EXCEPTION WHEN duplicate_object THEN null; END $$`;
  await sql`DO $$ BEGIN CREATE TYPE ticket_status AS ENUM ('A Fazer', 'Em Andamento', 'Pendente Cliente', 'Concluído'); EXCEPTION WHEN duplicate_object THEN null; END $$`;
  await sql`DO $$ BEGIN CREATE TYPE ticket_urgencia AS ENUM ('Crítica', 'Alta', 'Média', 'Baixa'); EXCEPTION WHEN duplicate_object THEN null; END $$`;
  await sql`DO $$ BEGIN CREATE TYPE ticket_categoria AS ENUM ('Suporte', 'Implantação', 'Comercial', 'Cobrança'); EXCEPTION WHEN duplicate_object THEN null; END $$`;
  await sql`DO $$ BEGIN CREATE TYPE whatsapp_status AS ENUM ('connected', 'connecting', 'disconnected'); EXCEPTION WHEN duplicate_object THEN null; END $$`;
  await sql`DO $$ BEGIN CREATE TYPE conversation_status AS ENUM ('active', 'closed', 'transferred'); EXCEPTION WHEN duplicate_object THEN null; END $$`;
  await sql`DO $$ BEGIN CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted'); EXCEPTION WHEN duplicate_object THEN null; END $$`;

  logger.info('Enums OK');

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role user_role NOT NULL DEFAULT 'OPERADOR',
      avatar VARCHAR(10),
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS clients (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nome VARCHAR(255) NOT NULL,
      cnpj VARCHAR(20) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL,
      whatsapp VARCHAR(20) NOT NULL,
      tipo_tef tipo_tef NOT NULL,
      status client_status NOT NULL DEFAULT 'ativo',
      valor_tef NUMERIC(10,2) NOT NULL DEFAULT 0,
      custo NUMERIC(10,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS tickets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      titulo VARCHAR(255) NOT NULL,
      descricao TEXT NOT NULL,
      client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
      client_name VARCHAR(255),
      urgencia ticket_urgencia NOT NULL DEFAULT 'Média',
      status ticket_status NOT NULL DEFAULT 'A Fazer',
      categoria ticket_categoria NOT NULL DEFAULT 'Suporte',
      atribuido_a VARCHAR(255),
      parecer_tecnico TEXT,
      tags TEXT[],
      tempo_gasto INTEGER DEFAULT 0,
      mensagens_nao_lidas INTEGER DEFAULT 0,
      created_by UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS ticket_activities (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
      tipo VARCHAR(50) NOT NULL,
      usuario VARCHAR(255) NOT NULL,
      acao VARCHAR(255) NOT NULL,
      detalhes TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS whatsapp_instances (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      instance_name VARCHAR(255) NOT NULL UNIQUE,
      qr_code TEXT,
      status whatsapp_status NOT NULL DEFAULT 'disconnected',
      phone_number VARCHAR(20),
      evolution_api_key VARCHAR(255) NOT NULL,
      evolution_base_url VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS whatsapp_conversations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      instance_id UUID NOT NULL REFERENCES whatsapp_instances(id) ON DELETE CASCADE,
      client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
      remote_jid VARCHAR(255) NOT NULL,
      contact_name VARCHAR(255),
      status conversation_status NOT NULL DEFAULT 'active',
      current_state VARCHAR(100) DEFAULT 'initial',
      operator_id UUID REFERENCES users(id) ON DELETE SET NULL,
      ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
      started_at TIMESTAMP NOT NULL DEFAULT NOW(),
      transferred_to_human_at TIMESTAMP,
      closed_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS whatsapp_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      instance_id UUID NOT NULL REFERENCES whatsapp_instances(id) ON DELETE CASCADE,
      conversation_id UUID REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
      client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
      remote_jid VARCHAR(255) NOT NULL,
      message_text TEXT,
      message_type VARCHAR(50) NOT NULL DEFAULT 'text',
      sender VARCHAR(50) NOT NULL,
      media_url VARCHAR(500),
      media_base64 TEXT,
      timestamp TIMESTAMP NOT NULL,
      is_read BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS whatsapp_leads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      instance_id UUID NOT NULL REFERENCES whatsapp_instances(id) ON DELETE CASCADE,
      remote_jid VARCHAR(255) NOT NULL,
      phone_number VARCHAR(20) NOT NULL,
      name VARCHAR(255),
      email VARCHAR(255),
      company VARCHAR(255),
      status lead_status NOT NULL DEFAULT 'new',
      captured_at TIMESTAMP NOT NULL DEFAULT NOW(),
      converted_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(500) NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS legacy_contratos (
      id BIGINT PRIMARY KEY,
      razao TEXT, cnpj VARCHAR(30), valor NUMERIC(10,2),
      rua TEXT, numero TEXT, complemento TEXT, bairro TEXT,
      cep TEXT, cidade TEXT, uf VARCHAR(5), email TEXT,
      data TEXT, testemunha TEXT, cpf_test TEXT,
      status TEXT DEFAULT 'Gerado', enviado BOOLEAN DEFAULT false,
      email_dest TEXT, data_envio TEXT, data_criacao TEXT,
      imported_at TIMESTAMP DEFAULT NOW()
    )
  `;

  logger.info('Migrations complete!');
  await sql.end();
}

migrate().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});