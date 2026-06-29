# LifeOS — Project Handoff

Contexto completo do **LifeOS** para o próximo agente continuar sem perder contexto.

## 📍 Localização
**Caminho:** `c:\Users\joaoi\OneDrive\Área de Trabalho\Pessoal\LifeOS`
**Porta dev:** `3030` → `npm run dev -- -p 3030`

## 🛠️ Stack REAL (atenção: divergia do handoff antigo)
- **Next.js 16.2.9** (App Router, **Turbopack default**) + **React 19.2** + TypeScript.
- Tailwind **v4** (sem `tailwind.config.js`; configurado no `globals.css`) — estética **Claymorphism** (`.clay-card`, `.clay-btn`, `.clay-panel`). Fonte Nunito. PT-BR.
- **Prisma 6** + **SQLite** (dev). Schema agnóstico p/ migrar a PostgreSQL.
- **Auth.js v5** (`next-auth@beta`) + `@auth/prisma-adapter`.
- Libs: `zod` (validação), `node-ical` (Canvas), `googleapis` (Google Calendar), `date-fns`/`date-fns-tz`.

### ⚠️ Regras do Next.js 16 (ler `node_modules/next/dist/docs/01-app/`)
- `cookies()`/`headers()`/`params`/`searchParams` são **async** → sempre `await`.
- `middleware` → **`proxy`** (runtime nodejs). Não usamos (single-user, sem gate).
- `node-ical` e `googleapis` estão em `serverExternalPackages` (`next.config.ts`) — senão o build quebra (`BigInt is not a function`).
- Páginas que leem o DB usam `export const dynamic = 'force-dynamic'`.
- ⚠️ **NextAuth v5 + Turbopack TRAVA** o handler `/api/auth/*` no `next dev` (requests ficam pendurados, HTTP 000). Funciona em **produção** (`npm run build && npm start`) e em **`npm run dev:webpack`** (dev sem Turbopack). Para login Google em dev, use `dev:webpack`.

## 🧱 Arquitetura
- **Single-user local.** `src/lib/user.ts` → `getCurrentUser()` / `getCurrentUserId()` (React `cache()`) centraliza o antigo `prisma.user.findFirst()`. Cria um usuário placeholder se não houver.
- **Cofre de tokens:** `src/lib/integrations/vault.ts` usa `src/lib/crypto.ts` (AES-256-GCM) p/ criptografar `accessToken`/`refreshToken`/`webhookUrl`/`icalUrl` na tabela `Integration`. Funções: `saveIntegration`, `getDecrypted`, `listIntegrations`, `markSync`, `disconnect`.
- **Conectores:** `src/lib/integrations/connectors/`
  - `google.ts` — refresh OAuth + Calendar API. Full sync da janela -30d/+120d (paginado por `nextPageToken`, todas as páginas), gravado num `$transaction`. Persiste tokens renovados. Obs.: `syncToken` incremental é incompatível com `timeMin/timeMax/orderBy`, por isso usa janela.
  - `canvas.ts` — `node-ical` → upsert `CalendarEvent` (source=canvas).
  - `clickup.ts` — REST v2: pull de tasks (source=clickup) + `pushClickUpStatus` (bidirecional; ClickUp = fonte da verdade).
  - `discord.ts` — `notifyDiscord()` via webhook.
  - `index.ts` — `syncAll(userId)` roda só os provedores conectados, isolando falhas.
- **Jobs:** rotas protegidas por `CRON_SECRET`:
  - `GET/POST /api/cron/sync` → `syncAll`.
  - `GET/POST /api/cron/notify` → avalia `NotificationRule` (enabled, canal discord, janela `HH:mm-HH:mm`) e `Alarm` (por horário, idempotente no dia via `lastFiredAt`) e dispara no Discord. Lógica em `src/lib/notify.ts` (`runNotifications`). Tipos de regra: daily_digest, task_due, water_reminder, event_soon, budget_over.
  - Disparo: `curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3030/api/cron/sync`
  - Botão **"Sincronizar agora"** em `/conexoes` e `/agenda` (`src/components/SyncButton.tsx` → `actions/sync.ts`).

## ✅ Módulos (todos funcionais)
- **Dashboard** (`/`): timeline de hoje, anel de água, Top 3 tarefas, saldo + alerta de orçamento, progresso de metas, badge de alertas real (orçamentos estourados + tarefas de hoje), "próxima ação".
- **Agenda** (`/agenda`): vista unificada Google/Canvas/ClickUp (semana/lista), cor por fonte. `components/AgendaView.tsx`.
- **Tarefas** (`/tarefas`): prioridade, prazo, exclusão, tag de origem. Sync bidirecional ClickUp ao concluir.
- **Metas & Hábitos** (`/metas`): metas com progresso; hábitos com streak via `HabitLog`.
- **Alarmes** (`/alarmes`): CRUD (hora, recorrência, tipo, canais app/discord).
- **Finanças** (`/financas`): contas, transações, cofres + **orçamentos** com alerta de estouro.
- **Notificações** (`/notificacoes`): CRUD de regras (evento/canal/janela).
- **Relatórios** (`/relatorios`): receitas/despesas 30d, gasto por categoria, progresso de metas.
- **Água** (`/agua`), **Dieta** (`/dieta`), **Conexões** (`/conexoes`), **Ajustes** (`/configuracoes`).

## 🔐 Variáveis de ambiente (ver `.env.example`)
`DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `AUTH_TRUST_HOST`, **`ENCRYPTION_KEY`** (hex 32 bytes — `openssl rand -hex 32`; sem isso tokens quebram entre restarts), `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, **`CRON_SECRET`**.

## ▶️ Como rodar
```bash
npm install
npx prisma db push          # aplica schema
node prisma/seed.js         # popula dados (ou: npm run seed)
npm run dev:webpack -- -p 3030   # dev COM login Google funcionando (Turbopack trava o auth)
# ou: npm run dev -- -p 3030      # mais rápido, mas /api/auth/* trava
```
Login Google: gere o OAuth Client no Google Cloud (redirect `http://localhost:3030/api/auth/callback/google`), preencha `GOOGLE_CLIENT_ID/SECRET` (via `/configuracoes` ou `.env`), reinicie, clique "Conectar com Google" em `/conexoes`. Os tokens vão criptografados para o cofre (`events.signIn` em `src/auth.ts`).

## 🚀 Próximos passos sugeridos
1. **Obsidian** (daily notes) e **bot do Discord** com comandos (vision Fase 3).
2. **Outlook/Apple Calendar**, importação financeira CSV/OFX, sugestões com IA (Fase 4).
3. Migrar SQLite → PostgreSQL em produção (schema já compatível).
4. UI dedicada p/ alarmes recorrentes "once" (hoje `lastFiredAt` evita repetição no dia; um alarme "once" não se auto-remove após disparar).

## 📂 Arquivos-chave
`prisma/schema.prisma` · `src/lib/{user,crypto,calendar}.ts` · `src/lib/integrations/**` · `src/app/api/cron/**` · `src/auth.ts` · `src/app/page.tsx` · `src/app/conexoes/page.tsx` · `next.config.ts` (serverExternalPackages).
