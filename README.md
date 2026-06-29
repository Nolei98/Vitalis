# LifeOS — Personal Life Operating System

> Desenvolvido por **Nolei Creative**

LifeOS é um sistema operacional pessoal completo, construído com Next.js 16 e React 19, que centraliza agenda, tarefas, dieta, hidratação, finanças, metas, alarmes, social e relatórios em uma única aplicação local multi-usuário.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Stack Tecnológica](#stack-tecnológica)
- [Módulos](#módulos)
- [Módulo Social](#módulo-social)
- [Backup e Integração com Google Sheets](#backup-e-integração-com-google-sheets)
- [Estrutura de Arquivos](#estrutura-de-arquivos)
- [Configuração e Instalação](#configuração-e-instalação)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Banco de Dados](#banco-de-dados)
- [Autenticação](#autenticação)
- [Design System — Soft Vitalis](#design-system--soft-vitalis)
- [Scripts Disponíveis](#scripts-disponíveis)

---

## Visão Geral

O LifeOS foi concebido como um hub de produtividade e bem-estar para uso local em rede doméstica ou corporativa. Todos os dados ficam no dispositivo (SQLite), com backup opcional para Google Sheets. A interface é 100% em português brasileiro e segue a identidade visual **Soft Vitalis** — cards com neomorfismo, gradientes suaves e cor-destaque por módulo.

**Características principais:**
- Multi-usuário com autenticação por senha (HMAC-SHA256, cookie httpOnly)
- Sem dependência de cloud — roda 100% local
- Chat em tempo real via Server-Sent Events (SSE)
- Backup automático semanal para Google Sheets
- Design responsivo com sidebar para desktop

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16.x (App Router, Server Actions) |
| UI | React 19, Tailwind CSS v4 |
| Banco de dados | SQLite via Prisma ORM |
| Autenticação | HMAC-SHA256 + cookie httpOnly (sem JWT externo) |
| Realtime | Server-Sent Events (SSE) nativo Next.js |
| Gráficos | Recharts (AreaChart, BarChart) + SVG puro (DonutRing) |
| Fonte | Nunito (Google Fonts) |
| Scheduler | node-cron (backup semanal) |
| Backup | Google Sheets via HTTP (Apps Script intermediário) |

---

## Módulos

### Dashboard (`/`)
Painel central com:
- Hero card com gráfico de tendência semanal de kcal (AreaChart)
- 5 stat cards com SparkLines: Saldo, Eventos, Tarefas, Água, Refeições
- DonutRing de hidratação com botões de registro rápido
- Agenda do dia e top-3 tarefas pendentes
- Progresso das metas ativas
- Atalhos rápidos: 💬 Mensagens, 🔔 Notificações, 🔌 Conexões

### Agenda (`/agenda`)
- Calendário semanal com eventos coloridos por fonte
- Criação de eventos com horário, local, recorrência e notas

### Tarefas (`/tarefas`)
- Lista de tarefas com prioridade, prazo e subtarefas
- Filtro por status; barra de progresso geral

### Dieta (`/dieta`)
- Registro de refeições com calorias, proteínas, carboidratos e gorduras
- Meta diária de kcal configurável no perfil

### Hidratação (`/agua`)
- Registro de copos/ml com botões rápidos
- DonutRing de progresso em relação à meta (padrão 2.000ml/dia)
- Histórico semanal

### Finanças (`/financas`)
- Múltiplas contas (corrente, poupança, carteira)
- Transações por categoria; orçamentos mensais com alertas de excesso
- BarChart de gastos vs limite

### Metas (`/metas`)
- Metas com tipo (valor, hábito, missão), progresso e prazo
- Hábitos vinculados com rastreamento diário

### Alarmes (`/alarmes`)
- Alarmes com hora, dias da semana e rótulo
- Regras de notificação por evento de sistema

### Relatórios (`/relatorios`)
- Resumo de todos os módulos; BarChart de gastos por categoria

### Configurações (`/configuracoes`)
- Perfil: nome, e-mail, meta de kcal

### Usuários (`/usuarios`)
- Gestão de perfis multi-usuário; backup individual ou global para Sheets

### Conexões (`/conexoes`)
- Status das integrações externas e configuração de SHEETS_API_URL

---

## Módulo Social

O módulo Social (`/social`) permite interações entre os usuários cadastrados na mesma instância do LifeOS.

### Funcionalidades

| Feature | Rota |
|---------|------|
| Hub social (squads + DMs) | `/social` |
| Amigos (busca, pedidos, remoção) | `/social/amigos` |
| Perfil público | `/social/perfil/[id]` |
| Editar perfil | `/social/configurar-perfil` |
| Chat DM ou squad | `/social/chat/[key]` |
| Squad detail (5 tabs) | `/social/squad/[id]` |
| Ranking global | `/social/ranking` |

### Chat em Tempo Real (SSE)
- Endpoint: `GET /api/social/stream?key=<chatKey>&since=<iso>`
- Poll a cada 2 segundos; `since` avança no servidor após cada resposta
- Reconexão automática no cliente em caso de erro
- Update otimista: mensagem aparece imediatamente (⌛) e solidifica quando SSE confirma
- Suporte a: texto, imagens (upload local `public/uploads/social/`), reações emoji, reply

### Squads
- Tipos: Estudos 📚, Academia 🏋️, Compras 🛒, Metas 🎯
- Tabs: Ranking (XP semanal), Sessões, Metas do Squad, Desafios / Lista de compras, Membros
- Convite por código (`inviteCode`)

### Sistema de XP e Badges
- XP = `floor(durationMin / 5)` por sessão registrada
- Período semanal: chave `YYYY-WNN`
- Badges automáticos: `hours_10`, `hours_100`, `checkin_10`

### Notificações
- Badge magenta no ícone 🤝 do sidebar, atualizado a cada 20s
- Cursor baseado em `localStorage(social_last_seen)` — zera ao entrar em `/social/*`
- API: `GET /api/social/unread?since=<iso>`

### Formato de chave DM
```
dm-{[userId1, userId2].sort().join('_')}
```
Exemplo: `dm-cma001_cmb002` — único e bidirecional.

---

## Backup e Integração com Google Sheets

### Como funciona

O backup exporta dados de nutrição e hidratação para uma planilha Google via um Apps Script intermediário (sem OAuth direto).

```
LifeOS  →  POST SHEETS_API_URL  →  Google Apps Script  →  Google Sheets
```

### Backup Automático
- **Quando:** Todo domingo às 23:00 (America/Sao_Paulo)
- **Implementação:** `node-cron` via `instrumentation-node.ts` (inicializado junto ao servidor)
- **O que exporta:** Refeições (`Meal`), alimentos (`Food`) e logs de água (`WaterLog`)

### Backup Manual
- **Por usuário:** Botão "Salvar no Drive" em `/usuarios`
- **Global:** Botão "Backup de todos" em `/usuarios`

### Configuração
```env
SHEETS_API_URL=https://script.google.com/macros/s/<ID>/exec
```

Se `SHEETS_API_URL` não estiver definida, o cron não é registrado e os botões retornam erro explicativo. Nenhuma outra funcionalidade é afetada.

---

## Estrutura de Arquivos

```
src/
├── app/
│   ├── page.tsx                  # Dashboard
│   ├── layout.tsx                # Layout global (Sidebar + Footer Nolei Creative)
│   ├── globals.css               # Design tokens + utilidades Soft Vitalis
│   ├── actions/                  # Server Actions (auth, social, sheets)
│   ├── api/
│   │   └── social/
│   │       ├── stream/route.ts   # SSE de mensagens
│   │       ├── upload/route.ts   # Upload de imagens
│   │       ├── search/route.ts   # Busca de usuários
│   │       └── unread/route.ts   # Contagem de não lidas
│   ├── social/                   # Módulo Social completo
│   ├── termos/                   # Termos de Uso
│   └── ...                       # Demais módulos (agenda, tarefas, dieta, etc.)
├── components/
│   ├── Sidebar.tsx               # Navegação lateral + badge social
│   ├── charts/                   # TrendArea, SparkLine, DonutRing, BarChartSimple
│   └── social/                   # ChatWindow, SquadTabs, FriendActions, UnreadBadge, ...
├── lib/
│   ├── prisma.ts                 # Cliente Prisma singleton
│   ├── session.ts                # Cookie HMAC-SHA256
│   ├── user.ts                   # getCurrentUser (memoizado com React cache)
│   ├── social.ts                 # Helpers server-only do módulo social
│   ├── weekTrend.ts              # Séries temporais para gráficos
│   └── integrations/sheets.ts   # Cliente HTTP do Apps Script
├── instrumentation.ts            # Entry point Node.js
└── instrumentation-node.ts       # Registro do cron de backup semanal

prisma/
└── schema.prisma                 # 28 modelos (User → Badge)

public/
└── uploads/social/               # Imagens de chat (criado automaticamente)
```

---

## Configuração e Instalação

### Pré-requisitos
- Node.js 20+
- npm 10+

### Instalação

```bash
git clone <repositório>
cd "Today's Meal"
npm install
```

### Banco de dados

```bash
npx prisma db push
npx prisma studio   # opcional — interface visual
```

### Executar

```bash
# Desenvolvimento (Webpack, porta 3030)
npm run dev:webpack -- --port 3030

# Ou com Turbopack (porta 3000)
npm run dev
```

### Primeiro acesso

1. Acesse `http://localhost:3030/register`
2. Crie sua conta
3. Você será redirecionado para o Dashboard

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
# Obrigatório em produção
AUTH_SECRET=sua-chave-secreta-longa-e-aleatoria

# Opcional — backup Google Sheets
SHEETS_API_URL=https://script.google.com/macros/s/<ID>/exec
```

> Se `AUTH_SECRET` não estiver definido, usa `dev-insecure-secret-change-me`. **Nunca use em produção.**

---

## Banco de Dados

SQLite gerenciado pelo Prisma ORM. Arquivo em `prisma/dev.db`.

### Modelos principais

| Modelo | Descrição |
|--------|-----------|
| `User` | Usuário com senha hash, handle, bio, avatar |
| `Task` | Tarefas com prioridade, prazo, subtarefas |
| `WaterLog` | Registros de hidratação |
| `Meal` / `Food` | Dieta com macronutrientes |
| `CalendarEvent` | Eventos de agenda |
| `Goal` / `Habit` / `HabitLog` | Metas e hábitos com rastreamento diário |
| `FinAccount` / `Transaction` / `Budget` | Finanças pessoais |
| `Alarm` / `NotificationRule` | Alarmes e notificações |
| `Friendship` | Amizades (pending / accepted / blocked) |
| `Squad` / `SquadMember` | Grupos sociais com tipos e papéis |
| `Message` / `Attachment` / `Reaction` | Chat com mídia e reações |
| `ActivitySession` | Sessões de atividade com duração e XP |
| `UserScore` | Ranking semanal por squad e global |
| `Badge` | Conquistas desbloqueadas automaticamente |
| `Challenge` / `SquadGoal` / `ShoppingItem` | Features de squad |

---

## Autenticação

Sistema próprio sem dependências externas:

1. **Registro:** senha hasheada com `salt:HMAC-SHA256(salt, senha)`
2. **Login:** valida hash, cria cookie `lifeos_session = userId.HMAC(userId)`
3. **Verificação:** `getSessionUserId()` valida o HMAC a cada request
4. **Middleware:** verifica apenas a *presença* do cookie (edge runtime)

---

## Design System — Soft Vitalis

Tokens CSS em `src/app/globals.css`:

```css
--app-bg: #F4F2FE;

/* Por módulo: --mod-<nome>, --mod-<nome>-bg, --mod-<nome>-strong */
--mod-dash:       #7C5CFC;   /* Dashboard — violeta  */
--mod-agenda:     #5B8DEF;   /* Agenda — azul        */
--mod-tarefas:    #2BC48A;   /* Tarefas — verde      */
--mod-dieta:      #FF8A5B;   /* Dieta — laranja      */
--mod-agua:       #36C5F0;   /* Hidratação — ciano   */
--mod-financas:   #8B5CF6;   /* Finanças — roxo      */
--mod-metas:      #FF6FB5;   /* Metas — rosa         */
--mod-alarmes:    #FFB020;   /* Alarmes — âmbar      */
--mod-relatorios: #14B8A6;   /* Relatórios — teal    */
--mod-social:     #D946EF;   /* Social — magenta     */
```

**Classes utilitárias:**
- `.clay-card` / `.clay-btn` / `.clay-panel` — neomorfismo suave
- `.hero-gradient` — gradiente do card hero
- `.page-enter` — animação de entrada fade+slide
- `.no-scrollbar` — scroll sem barra visível

---

## Scripts Disponíveis

```bash
npm run dev              # Next.js dev com Turbopack (porta 3000)
npm run dev:webpack      # Next.js dev com Webpack
npm run build            # Build de produção
npm run start            # Servidor de produção
npm run lint             # ESLint
```

---

## Licença e Créditos

© 2026 **Nolei Creative** — Todos os direitos reservados.

Este software é proprietário. É proibida a reprodução, distribuição ou criação de obras derivadas sem autorização prévia e por escrito da Nolei Creative.

**Contato:** contato@noleicreative.com

Ao utilizar este software, você concorda com os [Termos de Uso](/termos).

---

*LifeOS — Seu sistema operacional pessoal · Desenvolvido por Nolei Creative*
