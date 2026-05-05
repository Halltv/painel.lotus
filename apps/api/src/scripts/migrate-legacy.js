/**
 * migrate-legacy.js
 * Migra contratos.json e smtp.json da versão antiga para o banco PostgreSQL.
 *
 * Uso:
 *   cd apps/api
 *   node src/scripts/migrate-legacy.js
 *
 * Variáveis necessárias no .env:
 *   DATABASE_URL=postgresql://...
 *   LEGACY_DATA_PATH=/root/lotus-tef/data   (opcional, padrão acima)
 */

import 'dotenv/config';
import postgres from 'postgres';
import { createHash, randomBytes } from 'crypto';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const DATA_PATH = process.env.LEGACY_DATA_PATH || '/root/lotus-tef/data';
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não definida no .env');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(password + salt).digest('hex');
  return `${salt}:${hash}`;
}

function readJson(filename) {
  const fullPath = resolve(DATA_PATH, filename);
  if (!existsSync(fullPath)) {
    console.warn(`⚠️  Arquivo não encontrado: ${fullPath} — pulando.`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(fullPath, 'utf-8'));
  } catch (e) {
    console.error(`❌ Erro ao ler ${fullPath}:`, e.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Iniciando migração de dados legados...\n');

  // ── 1. Garantir que o admin padrão existe ─────────────────────────────────
  console.log('👤 Criando usuário admin padrão...');
  await sql`
    INSERT INTO users (name, email, password_hash, role, avatar)
    VALUES ('Admin', 'admin@lotus.com', ${hashPassword('admin123')}, 'ADMIN', 'AD')
    ON CONFLICT (email) DO NOTHING
  `;
  console.log('   ✅ admin@lotus.com / admin123\n');

  // ── 2. Migrar contratos.json ───────────────────────────────────────────────
  const contratos = readJson('contratos.json');
  if (contratos && Array.isArray(contratos) && contratos.length > 0) {
    console.log(`📄 Migrando ${contratos.length} contratos...`);

    // A tabela de contratos não existe no schema novo — vamos criar uma
    // tabela simples de arquivo legado para não perder os dados.
    await sql`
      CREATE TABLE IF NOT EXISTS legacy_contratos (
        id            BIGINT PRIMARY KEY,
        razao         TEXT,
        cnpj          VARCHAR(30),
        valor         NUMERIC(10,2),
        rua           TEXT,
        numero        TEXT,
        complemento   TEXT,
        bairro        TEXT,
        cep           TEXT,
        cidade        TEXT,
        uf            VARCHAR(5),
        email         TEXT,
        data          TEXT,
        testemunha    TEXT,
        cpf_test      TEXT,
        status        TEXT DEFAULT 'Gerado',
        enviado       BOOLEAN DEFAULT false,
        email_dest    TEXT,
        data_envio    TEXT,
        data_criacao  TEXT,
        imported_at   TIMESTAMP DEFAULT NOW()
      )
    `;

    let ok = 0, skip = 0;
    for (const c of contratos) {
      try {
        await sql`
          INSERT INTO legacy_contratos
            (id, razao, cnpj, valor, rua, numero, complemento, bairro, cep,
             cidade, uf, email, data, testemunha, cpf_test, status, enviado,
             email_dest, data_envio, data_criacao)
          VALUES (
            ${c.id}, ${c.razao||null}, ${c.cnpj||null},
            ${parseFloat(c.valor)||0},
            ${c.rua||null}, ${c.numero||null}, ${c.complemento||null},
            ${c.bairro||null}, ${c.cep||null}, ${c.cidade||null},
            ${c.uf||null}, ${c.email||null}, ${c.data||null},
            ${c.testemunha||null}, ${c.cpfTest||null},
            ${c.status||'Gerado'}, ${!!c.enviado},
            ${c.emailDest||null}, ${c.dataEnvio||null}, ${c.dataCriacao||null}
          )
          ON CONFLICT (id) DO NOTHING
        `;
        ok++;
      } catch (e) {
        console.warn(`   ⚠️  Contrato ${c.id} pulado: ${e.message}`);
        skip++;
      }
    }
    console.log(`   ✅ ${ok} importados, ${skip} pulados\n`);
  }

  // ── 3. Migrar smtp.json ────────────────────────────────────────────────────
  const smtp = readJson('smtp.json');
  if (smtp && smtp.host) {
    console.log('📧 Salvando configuração SMTP...');
    await sql`
      CREATE TABLE IF NOT EXISTS legacy_smtp (
        id          SERIAL PRIMARY KEY,
        host        TEXT,
        port        TEXT,
        usuario     TEXT,
        senha       TEXT,
        nome        TEXT,
        imported_at TIMESTAMP DEFAULT NOW()
      )
    `;
    await sql`
      INSERT INTO legacy_smtp (host, port, usuario, senha, nome)
      VALUES (${smtp.host}, ${smtp.port||'587'}, ${smtp.user||null}, ${smtp.pass||null}, ${smtp.nome||null})
    `;
    console.log(`   ✅ SMTP salvo (host: ${smtp.host})\n`);
  }

  console.log('🎉 Migração concluída!\n');
  console.log('Acesse o painel e faça login com:');
  console.log('  Email: admin@lotus.com');
  console.log('  Senha: admin123\n');

  await sql.end();
}

main().catch(err => {
  console.error('❌ Falha na migração:', err.message);
  process.exit(1);
});
