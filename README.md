# 🧭 LifeOS

> **Sistema operacional da sua vida pessoal.** Um único dashboard que unifica agenda, tarefas, hidratação, dieta, finanças, metas, hábitos, alarmes e notificações — agregando **Google Calendar**, **Canvas LMS**, **ClickUp** e **Discord**.

LifeOS lê as ferramentas que você já usa e te mostra, num lugar só, "como está o meu dia": o que tem na agenda, o que fazer, quanto beber, quanto gastar — e te avisa no canal certo (Discord).

> ℹ️ **É um app web** (Next.js), não um APK Android. Roda no navegador, localmente na sua máquina. Os dados ficam só com você (SQLite local), com tokens criptografados.

---

## ✨ Funcionalidades

| Módulo | O que faz |
|---|---|
| 🧭 **Dashboard** | Visão do dia: timeline, anel de água, Top 3 tarefas, saldo + alerta de orçamento, progresso de metas, próxima ação. |
| 📅 **Agenda Unificada** | Eventos de Google + Canvas + ClickUp num só lugar (visão semana/lista), cor por fonte. |
| ✅ **Tarefas** | Prioridade, prazo, projetos. Importa do ClickUp e sincroniza status de volta (bidirecional). |
| 💧 **Hidratação** | Registro rápido e meta diária. |
| 🥗 **Dieta** | Refeições com calorias e proteínas. |
| 💰 **Finanças** | Contas, transações, cofres e **orçamentos** com alerta de estouro. |
| 🎯 **Metas & Hábitos** | Metas com progresso; hábitos com streak (sequência de dias). |
| ⏰ **Alarmes** | Lembretes por horário (app/Discord). |
| 🔔 **Notificações** | Regras de o quê/quando/canal → digest e avisos no Discord. |
| 📊 **Relatórios** | Receitas/despesas, gasto por categoria, progresso de metas. |
| 🔗 **Conexões** | Conecta e sincroniza as integrações. |

---

## 🛠️ Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — estética *Claymorphism*
- **Prisma 6** + **SQLite** (dev; schema pronto para PostgreSQL)
- **Auth.js v5** (`next-auth`) — login Google + tokens OAuth
- Integrações: `googleapis`, `node-ical` (Canvas), `fetch` (ClickUp/Discord)

---

## 🚀 Começando

### Pré-requisitos
- **Node.js 20.9+**
- npm

### 1. Instalar
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Copie o exemplo e preencha:
```bash
cp .env.example .env
```

| Variável | Para que serve | Como gerar |
|---|---|---|
| `DATABASE_URL` | Banco SQLite | já vem `file:./dev.db` |
| `AUTH_SECRET` | Segredo do Auth.js | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL base | `http://localhost:3030` |
| `AUTH_TRUST_HOST` | Confiar no host local | `true` |
| `ENCRYPTION_KEY` | **Criptografa os tokens** das integrações | `openssl rand -hex 32` (32 bytes = 64 hex) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Login Google + Calendar | ver [Google](#-google-calendar) |
| `CRON_SECRET` | Protege as rotas de sync/notify | `openssl rand -hex 24` |

> ⚠️ Sem um `ENCRYPTION_KEY` fixo, os tokens das integrações deixam de descriptografar a cada restart. Gere uma vez e mantenha.

### 3. Preparar o banco
```bash
npx prisma db push   # cria as tabelas
npm run seed         # dados de exemplo (opcional)
```

### 4. Rodar
```bash
npm run dev:webpack -- -p 3030
```
Abra **http://localhost:3030**.

> ⚠️ **Use `dev:webpack`, não `dev`.** O `npm run dev` (Turbopack) **trava o login Google** (`/api/auth/*` não responde). Em `dev:webpack` e em produção o login funciona.

| Comando | Quando usar |
|---|---|
| `npm run dev:webpack` | Desenvolvimento **com login Google funcionando** (recomendado) |
| `npm run dev` | Mais rápido, mas **sem** login Google (Turbopack trava o auth) |
| `npm run build && npm start` | Produção |

---

## 🔌 Conectando as integrações

Vá em **Conexões** (`/conexoes`). Depois de conectar, clique **"Sincronizar agora"**.

### 🟦 Google Calendar
1. No [Google Cloud Console](https://console.cloud.google.com/): crie um **OAuth Client ID** (tipo *Web application*).
2. Em **Authorized redirect URIs**, adicione exatamente:
   ```
   http://localhost:3030/api/auth/callback/google
   ```
3. Copie **Client ID** e **Client Secret** para o `.env` (ou cole em `/configuracoes`) e **reinicie o servidor**.
4. **Ative a Google Calendar API** para o projeto: APIs & Services → Library → *Google Calendar API* → **Enable**.
5. Em `/conexoes`, clique **"Conectar com Google"** e autorize.

### 🔴 Canvas LMS
- No Canvas: **Calendário → Feed do calendário** → copie a URL `.ics`.
- Cole em `/conexoes` (campo Canvas) e salve.

### 🟣 ClickUp
- ClickUp: **Settings → Apps → API Token** (pessoal, começa com `pk_`).
- Cole em `/conexoes` (campo ClickUp).

### 🟦 Discord
- No servidor: **Editar canal → Integrações → Webhooks → Novo webhook** → copie a URL.
- Cole em `/conexoes` (campo Discord). Use **"Testar webhook"** para confirmar.

---

## 🔄 Sincronização e notificações

Há duas rotas protegidas por `CRON_SECRET`:

```bash
# Sincroniza eventos (Google/Canvas) e tarefas (ClickUp)
curl -H "Authorization: Bearer SEU_CRON_SECRET" http://localhost:3030/api/cron/sync

# Avalia regras/alarmes e envia avisos no Discord
curl -H "Authorization: Bearer SEU_CRON_SECRET" http://localhost:3030/api/cron/notify
```

- Também há o botão **"Sincronizar agora"** em `/agenda` e `/conexoes`.
- **Notificações** (`/notificacoes`): crie regras (`daily_digest`, `task_due`, `water_reminder`, `event_soon`, `budget_over`) com canal e janela de horário (`07:00-21:00`).
- **Alarmes** (`/alarmes`): disparam por horário; não repetem no mesmo dia.

### Automatizar (Windows Task Scheduler)
Crie uma tarefa que rode periodicamente:
```bat
curl -H "Authorization: Bearer SEU_CRON_SECRET" http://localhost:3030/api/cron/sync
```
Sugestão: `sync` a cada 30 min, `notify` a cada 5–10 min (para pegar os horários dos alarmes).

---

## 📂 Estrutura

```
src/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── agenda|tarefas|agua|dieta|financas|metas|alarmes|relatorios|notificacoes|conexoes|configuracoes/
│   ├── actions/              # Server Actions (CRUD de cada módulo)
│   └── api/
│       ├── auth/[...nextauth]/  # Auth.js
│       └── cron/{sync,notify}/  # Jobs protegidos por CRON_SECRET
├── lib/
│   ├── user.ts               # getCurrentUser() (single-user)
│   ├── crypto.ts             # AES-256-GCM (cofre de tokens)
│   ├── calendar.ts           # helpers de data/agenda
│   ├── notify.ts             # regras + alarmes → Discord
│   └── integrations/
│       ├── vault.ts          # tokens criptografados (Integration)
│       └── connectors/       # google, canvas, clickup, discord, index(syncAll)
├── components/               # UI (TaskCheckbox, WaterButtons, AgendaView, SyncButton, ...)
└── auth.ts                   # config NextAuth
prisma/schema.prisma          # modelo de dados
```

---

## 🩺 Problemas comuns

| Sintoma | Causa / Solução |
|---|---|
| Login Google "não conecta" / `/api/auth/*` trava | Você está em `npm run dev` (Turbopack). Use **`npm run dev:webpack`** ou produção. |
| `redirect_uri_mismatch` | Adicione `http://localhost:3030/api/auth/callback/google` nas *Authorized redirect URIs* do Google. |
| Sync Google: *"Calendar API has not been used / disabled"* | Ative a **Google Calendar API** no projeto e aguarde ~2 min. |
| Build falha com `BigInt is not a function` | `node-ical`/`googleapis` precisam estar em `serverExternalPackages` (já configurado em `next.config.ts`). |
| Tokens "somem" após reiniciar | Defina um `ENCRYPTION_KEY` fixo no `.env`. |
| Porta 3030 ocupada | `npx kill-port 3030`. |

---

## 🔐 Privacidade

App single-user, **local**. Dados em SQLite na sua máquina. Tokens de integração (Google/Canvas/ClickUp/Discord) são guardados **criptografados** (AES-256-GCM) via `ENCRYPTION_KEY`. `.env` e `dev.db` ficam fora do Git.

---

## 📜 Scripts

| Script | Ação |
|---|---|
| `npm run dev:webpack` | Dev com login funcionando |
| `npm run dev` | Dev rápido (sem auth) |
| `npm run build` | Build de produção |
| `npm start` | Servidor de produção |
| `npm run seed` | Popula dados de exemplo |
| `npm run lint` | ESLint |
