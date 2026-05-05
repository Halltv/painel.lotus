import 'dotenv/config';
import postgres from 'postgres';
import { createHash, randomBytes } from 'crypto';
import logger from '../utils/logger.js';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/whatsapp_db';
const sql = postgres(databaseUrl);

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(password + salt).digest('hex');
  return `${salt}:${hash}`;
}

async function seed() {
  logger.info('Seeding database...');

  // Seed users
  const users = await sql`
    INSERT INTO users (name, email, password_hash, role, avatar) VALUES
      ('Admin User', 'admin@lotus.com', ${hashPassword('password123')}, 'ADMIN', 'AU'),
      ('Gerente User', 'gerente@lotus.com', ${hashPassword('password123')}, 'GERENTE', 'GU'),
      ('Operador User', 'operador@lotus.com', ${hashPassword('password123')}, 'OPERADOR', 'OU')
    ON CONFLICT (email) DO NOTHING
    RETURNING id, name, role
  `;
  logger.info(`Seeded ${users.length} users`);

  // Seed clients
  const clientRows = await sql`
    INSERT INTO clients (nome, cnpj, email, whatsapp, tipo_tef, status, valor_tef, custo) VALUES
      ('Supermercado Silva', '12.345.678/0001-90', 'contato@silva.com', '(11) 99999-9999', 'tef_integrado', 'ativo', 450.00, 150.00),
      ('Padaria Pão Quente', '98.765.432/0001-10', 'padaria@paoquente.com', '(11) 98888-8888', 'tef_maquininha_wireless', 'implantacao', 120.00, 50.00),
      ('Posto Ipiranga', '45.678.901/0001-23', 'posto@ipiranga.com', '(11) 97777-7777', 'automacao_pdv', 'bloqueado', 800.00, 300.00),
      ('Farmácia Saúde', '33.444.555/0001-66', 'contato@saude.com', '(11) 96666-6666', 'tef_integrado', 'ativo', 300.00, 100.00),
      ('Loja de Roupas Moda', '11.222.333/0001-44', 'moda@loja.com', '(11) 95555-5555', 'tef_maquininha_wireless', 'ativo', 150.00, 50.00)
    ON CONFLICT (cnpj) DO NOTHING
    RETURNING id, nome
  `;
  logger.info(`Seeded ${clientRows.length} clients`);

  // Seed a few tickets
  if (clientRows.length > 0) {
    const adminUser = users.find(u => u.role === 'ADMIN');
    const statuses = ['A Fazer', 'Em Andamento', 'Pendente Cliente', 'Concluído'];
    const urgencias = ['Crítica', 'Alta', 'Média', 'Baixa'];
    const categorias = ['Suporte', 'Implantação', 'Comercial', 'Cobrança'];

    for (let i = 0; i < 10; i++) {
      const client = clientRows[i % clientRows.length];
      const status = statuses[i % statuses.length];
      const [ticket] = await sql`
        INSERT INTO tickets (titulo, descricao, client_id, client_name, urgencia, status, categoria, atribuido_a, tags, created_by)
        VALUES (
          ${`Chamado #${1000 + i} - ${categorias[i % categorias.length]}`},
          ${'Sistema apresentando problema que necessita de atenção imediata da equipe técnica.'},
          ${client.id},
          ${client.nome},
          ${urgencias[i % urgencias.length]},
          ${status},
          ${categorias[i % categorias.length]},
          ${'Admin User'},
          ${['suporte', 'tef']},
          ${adminUser?.id || null}
        )
        RETURNING id
      `;

      await sql`
        INSERT INTO ticket_activities (ticket_id, tipo, usuario, acao, detalhes)
        VALUES (${ticket.id}, 'criacao', 'Sistema', 'Chamado criado', 'Chamado aberto via portal')
      `;
    }
    logger.info('Seeded 10 tickets');
  }

  logger.info('Seed complete!');
  await sql.end();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
