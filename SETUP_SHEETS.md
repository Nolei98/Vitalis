# Vitalis — Usuários na Planilha + Deploy na Vercel

Este guia liga o app a uma **planilha do Google** (via Google Apps Script) para ter
**login multi-dispositivo** com refeições, alimentos e água sincronizados — e publica
tudo na **Vercel**.

> Sem `VITE_SHEETS_API_URL` configurada, o app continua funcionando 100% offline
> (só `localStorage`). A planilha é opcional — ao configurá-la, vira a fonte da verdade.

---

## Parte 1 — Criar a planilha e o backend (Apps Script)

1. Acesse **sheets.new** (ou Drive → Nova Planilha). Dê um nome, ex.: `TodaysMeal DB`.
2. Na planilha: menu **Extensões → Apps Script**.
3. Apague o conteúdo do `Code.gs` e **cole todo o conteúdo** de `apps-script/Code.gs`
   (deste projeto). Salve (Ctrl+S).
4. *(Opcional, recomendado)* no topo do script, troque `var TOKEN = '';` por um segredo
   simples, ex.: `var TOKEN = 'meu-segredo-123';` — você usará o mesmo valor no app.
5. Clique em **Implantar → Nova implantação**.
   - Engrenagem → tipo **App da Web**.
   - **Executar como:** Eu (sua conta).
   - **Quem tem acesso:** **Qualquer pessoa**.
   - **Implantar**. Autorize as permissões quando pedir (é seguro, é seu próprio script).
6. Copie a **URL do app da Web** (termina em **`/exec`**).
   - Teste: abra a URL no navegador. Deve aparecer
     `{"ok":true,"service":"Vitalis API","online":true}`.

A aba **Users** e os cabeçalhos são criados sozinhos no primeiro cadastro.
Colunas: `Email | Name | PasswordHash | Profile | Foods | Meals | Water | UpdatedAt`
(as senhas são guardadas só como hash SHA-256; refeições/alimentos/água ficam em JSON).

---

## Parte 2 — Configurar o app localmente

1. No arquivo **`.env.local`** (na raiz do projeto), preencha:
   ```
   VITE_SHEETS_API_URL=https://script.google.com/macros/s/SEU_ID/exec
   VITE_SHEETS_API_TOKEN=meu-segredo-123   # só se você definiu TOKEN no passo 1.4; senão deixe vazio
   ```
2. Reinicie o dev server (as variáveis só são lidas na inicialização):
   ```
   npm run dev
   ```
3. Teste em **http://localhost:5000**: crie uma conta → confira que apareceu uma linha
   na aba **Users** da planilha. Faça logout e login em outro navegador/aba anônima →
   seus dados (refeições, alimentos, água) devem vir junto.

---

## Parte 3 — Publicar na Vercel

1. Suba o projeto para um repositório no **GitHub** (a Vercel faz deploy a partir dele).
   Se ainda não é um repo git:
   ```
   git init && git add . && git commit -m "Vitalis"
   ```
   Crie o repo no GitHub e dê `git push`.
2. Em **vercel.com** → **Add New → Project** → importe o repositório.
   - Framework: **Vite** (detecção automática). Build: `npm run build`. Output: `dist`.
3. Em **Settings → Environment Variables**, adicione (para Production e Preview):
   | Nome | Valor |
   | --- | --- |
   | `GEMINI_API_KEY` | sua chave do Gemini |
   | `VITE_SHEETS_API_URL` | a URL `/exec` do Apps Script |
   | `VITE_SHEETS_API_TOKEN` | o token (se você definiu; senão omita) |
4. **Deploy**. Pronto — o app fica numa URL pública usando a mesma planilha.

> ⚠️ As três variáveis são lidas em **tempo de build**. Se alterar alguma na Vercel,
> rode um **Redeploy** para valer.

---

## Como funciona a sincronização

- **Login/Registro:** valida na planilha e baixa os dados do usuário para o `localStorage`
  (cache). Os componentes continuam lendo do cache — rápido e offline-friendly.
- **Gravações** (nova refeição, alimento, +250 ml de água, mudança de metas/perfil):
  salvam no `localStorage` e disparam um envio (debounced ~1,5 s) que regrava o "retrato"
  do usuário na planilha.
- **Multi-dispositivo:** ao logar em outro aparelho, os dados são puxados da planilha.
  Escrita usa *last-write-wins* (a última gravação vence) — adequado para 1 usuário em
  poucos dispositivos.
- **Acesso Free (visitante):** não sincroniza (não tem conta na planilha).

## Limitações / segurança (contexto acadêmico)

- Planilha **não é um banco de dados**: sem transações, sujeita a limites de cota do Google
  e a corridas de escrita se vários dispositivos editarem ao mesmo tempo.
- A URL do Apps Script é pública; o `TOKEN` reduz abuso casual, mas fica visível no bundle —
  não é segurança forte. Senhas ficam como hash SHA-256 (sem "sal").
- Para produção real, migrar para um banco (ex.: Vercel Postgres/Supabase) e mover o
  hash/validação 100% para o servidor.
