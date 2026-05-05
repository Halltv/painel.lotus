# Lotus TEF — Monorepo

Sistema de gestão para empresas de TEF (Transferência Eletrônica de Fundos). Inclui gestão de clientes, chamados, WhatsApp e wiki de soluções.

## Estrutura

```
apps/
  api/     → Backend Express + PostgreSQL (porta 3001)
  web/     → Frontend React + Vite (porta 3000)
```

---

## Setup Rápido

### 1. Pré-requisitos
- Node.js 20+
- PostgreSQL 14+

### 2. Banco de dados

Crie o banco:
```sql
CREATE DATABASE whatsapp_db;
```

### 3. Configurar variáveis de ambiente

`apps/api/.env`:
```env
PORT=3001
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/

# Evolution API (WhatsApp)
EVOLUTION_API_KEY=sua_api_key
EVOLUTION_BASE_URL=https://sua-evolution-api.com
EVOLUTION_WEBHOOK_URL=https://seu-dominio.com/hcgi/api/webhooks/whatsapp/webhook
WHATSAPP_INSTANCE_NAME=default_instance
```

### 4. Instalar dependências e migrar banco

```bash
# Instalar todas as dependências
npm install

# Criar tabelas e popular dados iniciais
npm run migrate --prefix apps/api
npm run seed --prefix apps/api
```

### 5. Rodar em desenvolvimento

```bash
npm run dev
```

Isso inicia API (3001) e frontend (3000) em paralelo.

---

## API Endpoints

### Auth
- `POST /hcgi/api/auth/login` — Login
- `POST /hcgi/api/auth/logout` — Logout
- `GET  /hcgi/api/auth/me` — Usuário atual

### Clientes
- `GET    /hcgi/api/clients` — Listar (query: `search`)
- `POST   /hcgi/api/clients` — Criar (ADMIN/GERENTE)
- `PUT    /hcgi/api/clients/:id` — Editar (ADMIN/GERENTE)
- `DELETE /hcgi/api/clients/:id` — Deletar (ADMIN)

### Chamados
- `GET    /hcgi/api/tickets` — Listar (query: `search`, `status`, `urgencia`)
- `POST   /hcgi/api/tickets` — Criar
- `PUT    /hcgi/api/tickets/:id` — Editar completo
- `PATCH  /hcgi/api/tickets/:id/status` — Atualizar status/urgência (drag & drop)
- `DELETE /hcgi/api/tickets/:id` — Deletar

### WhatsApp
- `GET    /hcgi/api/whatsapp/instances` — Listar instâncias
- `POST   /hcgi/api/whatsapp/instances` — Criar instância
- `DELETE /hcgi/api/whatsapp/instances/:id` — Remover instância
- `GET    /hcgi/api/whatsapp/conversations` — Listar conversas
- `GET    /hcgi/api/whatsapp/conversations/:id/messages` — Mensagens
- `POST   /hcgi/api/whatsapp/conversations/:id/send` — Enviar mensagem
- `POST   /hcgi/api/webhooks/whatsapp/webhook` — Webhook (Evolution API)

### Usuários (ADMIN)
- `GET    /hcgi/api/users` — Listar
- `POST   /hcgi/api/users` — Criar
- `PUT    /hcgi/api/users/:id/profile` — Editar perfil
- `DELETE /hcgi/api/users/:id` — Desativar

---

## Chatbot WhatsApp

Máquina de estados com fluxo completo:

```
initial → menu → suporte → [tef | impressora | sistema] → resolved
                → cobrança
                → informações
                → transferência para humano
```

Estados persistidos em `whatsapp_conversations.current_state`. Mensagens de operadores ficam como `sender: 'operator'`.

---

## Configurar WhatsApp (Evolution API)

1. Acesse **Configurações → WhatsApp**
2. Clique em **Nova Instância**
3. Preencha nome, API Key, URL base e URL do webhook
4. Escaneie o QR Code gerado pelo Evolution API
5. Conversas entrarão automaticamente via webhook
