import { pgTable, text, varchar, timestamp, integer, boolean, uuid, numeric, pgEnum } from 'drizzle-orm/pg-core';

// ─── Enums ────────────────────────────────────────────────────────────────────
export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'GERENTE', 'OPERADOR']);
export const clientStatusEnum = pgEnum('client_status', ['ativo', 'implantacao', 'bloqueado', 'inativo']);
export const tipoTefEnum = pgEnum('tipo_tef', ['tef_integrado', 'tef_maquininha_wireless', 'automacao_pdv']);
export const ticketStatusEnum = pgEnum('ticket_status', ['A Fazer', 'Em Andamento', 'Pendente Cliente', 'Concluído']);
export const ticketUrgenciaEnum = pgEnum('ticket_urgencia', ['Crítica', 'Alta', 'Média', 'Baixa']);
export const ticketCategoriaEnum = pgEnum('ticket_categoria', ['Suporte', 'Implantação', 'Comercial', 'Cobrança']);
export const whatsappStatusEnum = pgEnum('whatsapp_status', ['connected', 'connecting', 'disconnected']);
export const conversationStatusEnum = pgEnum('conversation_status', ['active', 'closed', 'transferred']);
export const leadStatusEnum = pgEnum('lead_status', ['new', 'contacted', 'qualified', 'converted']);

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('OPERADOR'),
  avatar: varchar('avatar', { length: 10 }),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── Clients ──────────────────────────────────────────────────────────────────
export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  nome: varchar('nome', { length: 255 }).notNull(),
  cnpj: varchar('cnpj', { length: 20 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull(),
  whatsapp: varchar('whatsapp', { length: 20 }).notNull(),
  tipoTef: tipoTefEnum('tipo_tef').notNull(),
  status: clientStatusEnum('status').notNull().default('ativo'),
  valorTef: numeric('valor_tef', { precision: 10, scale: 2 }).notNull().default('0'),
  custo: numeric('custo', { precision: 10, scale: 2 }).notNull().default('0'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── Tickets ──────────────────────────────────────────────────────────────────
export const tickets = pgTable('tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  titulo: varchar('titulo', { length: 255 }).notNull(),
  descricao: text('descricao').notNull(),
  clientId: uuid('client_id').references(() => clients.id, { onDelete: 'set null' }),
  clientName: varchar('client_name', { length: 255 }),
  urgencia: ticketUrgenciaEnum('urgencia').notNull().default('Média'),
  status: ticketStatusEnum('status').notNull().default('A Fazer'),
  categoria: ticketCategoriaEnum('categoria').notNull().default('Suporte'),
  atribuidoA: varchar('atribuido_a', { length: 255 }),
  parecerTecnico: text('parecer_tecnico'),
  tags: text('tags').array(),
  tempoGasto: integer('tempo_gasto').default(0),
  mensagensNaoLidas: integer('mensagens_nao_lidas').default(0),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── Ticket Activities ────────────────────────────────────────────────────────
export const ticketActivities = pgTable('ticket_activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  ticketId: uuid('ticket_id').notNull().references(() => tickets.id, { onDelete: 'cascade' }),
  tipo: varchar('tipo', { length: 50 }).notNull(),
  usuario: varchar('usuario', { length: 255 }).notNull(),
  acao: varchar('acao', { length: 255 }).notNull(),
  detalhes: text('detalhes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── WhatsApp Instances ───────────────────────────────────────────────────────
export const whatsappInstances = pgTable('whatsapp_instances', {
  id: uuid('id').primaryKey().defaultRandom(),
  instanceName: varchar('instance_name', { length: 255 }).notNull().unique(),
  qrCode: text('qr_code'),
  status: whatsappStatusEnum('status').notNull().default('disconnected'),
  phoneNumber: varchar('phone_number', { length: 20 }),
  evolutionApiKey: varchar('evolution_api_key', { length: 255 }).notNull(),
  evolutionBaseUrl: varchar('evolution_base_url', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── WhatsApp Conversations ───────────────────────────────────────────────────
export const whatsappConversations = pgTable('whatsapp_conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  instanceId: uuid('instance_id').notNull().references(() => whatsappInstances.id, { onDelete: 'cascade' }),
  clientId: uuid('client_id').references(() => clients.id, { onDelete: 'set null' }),
  remoteJid: varchar('remote_jid', { length: 255 }).notNull(),
  contactName: varchar('contact_name', { length: 255 }),
  status: conversationStatusEnum('status').notNull().default('active'),
  currentState: varchar('current_state', { length: 100 }).default('initial'),
  operatorId: uuid('operator_id').references(() => users.id, { onDelete: 'set null' }),
  ticketId: uuid('ticket_id').references(() => tickets.id, { onDelete: 'set null' }),
  startedAt: timestamp('started_at').notNull().defaultNow(),
  transferredToHumanAt: timestamp('transferred_to_human_at'),
  closedAt: timestamp('closed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── WhatsApp Messages ────────────────────────────────────────────────────────
export const whatsappMessages = pgTable('whatsapp_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  instanceId: uuid('instance_id').notNull().references(() => whatsappInstances.id, { onDelete: 'cascade' }),
  conversationId: uuid('conversation_id').references(() => whatsappConversations.id, { onDelete: 'cascade' }),
  clientId: uuid('client_id').references(() => clients.id, { onDelete: 'set null' }),
  remoteJid: varchar('remote_jid', { length: 255 }).notNull(),
  messageText: text('message_text'),
  messageType: varchar('message_type', { length: 50 }).notNull().default('text'),
  sender: varchar('sender', { length: 50 }).notNull(),
  mediaUrl: varchar('media_url', { length: 500 }),
  mediaBase64: text('media_base64'),
  timestamp: timestamp('timestamp').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── WhatsApp Leads ───────────────────────────────────────────────────────────
export const whatsappLeads = pgTable('whatsapp_leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  instanceId: uuid('instance_id').notNull().references(() => whatsappInstances.id, { onDelete: 'cascade' }),
  remoteJid: varchar('remote_jid', { length: 255 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  company: varchar('company', { length: 255 }),
  status: leadStatusEnum('status').notNull().default('new'),
  capturedAt: timestamp('captured_at').notNull().defaultNow(),
  convertedAt: timestamp('converted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Sessions ─────────────────────────────────────────────────────────────────
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 500 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
