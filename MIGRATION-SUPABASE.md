# Migração Lovable Cloud → Supabase próprio

Migração do backend do projeto Lovable Cloud (`rzxifiijynxcwfttxoio`) para o
projeto Supabase próprio (`npbqewavtpptqzzxoqzr`).

## O que foi feito

- **Config** apontada para o novo projeto: `.env` e `supabase/config.toml`.
- **Schema** recriado no projeto novo via `supabase db push` (todas as migrations
  em `supabase/migrations/`), incluindo extensões `pgmq`, `pg_cron`, `pg_net`,
  `supabase_vault`, o enum `app_role` e as funções RPC de email.
- **Bucket `avatars`** recriado (nova migration `20260629000000_create_avatars_bucket.sql`)
  — antes ele só existia via UI da Lovable, não em migration.
- **Email** desacoplado da API da Lovable e migrado para **Resend**
  (`src/lib/email/resend.server.ts` + `src/routes/lovable/email/queue/process.ts`).
- **Cron + Vault** recriados (`supabase/setup_email_queue_cron.sql` + secret
  `email_queue_service_role_key` no Vault).
- **Dados antigos NÃO foram migrados** (decisão do projeto — começar do zero).

## Variáveis de ambiente

### Públicas (commitadas em `.env`)
```
SUPABASE_URL / VITE_SUPABASE_URL                = https://npbqewavtpptqzzxoqzr.supabase.co
SUPABASE_PUBLISHABLE_KEY / VITE_...             = sb_publishable_SUqI9g...
SUPABASE_PROJECT_ID / VITE_...                  = npbqewavtpptqzzxoqzr
```

### Secretas (em `.env.local` no dev; no painel do host em produção)
```
SUPABASE_SERVICE_ROLE_KEY   = (Dashboard → Settings → API → service_role)
RESEND_API_KEY              = (resend.com → API Keys)
RESEND_FROM                 = contato@senaconsulting.app   (domínio verificado no Resend)
PUBLIC_SITE_URL             = https://senaconsulting.app   (opcional; usado no link de unsubscribe)
```
> `SUPABASE_DB_PASSWORD` em `.env.local` é usado SÓ para rodar migrations via CLI — não vai pro app/produção.

## Deploy na VERCEL

O build usa o preset Nitro **vercel** (forçado em `vite.config.ts`), gerando
`.vercel/output` (Build Output API v3). `vercel.json` fixa `bun install` /
`bun run build` e `framework: null`. O `vite dev` continua igual (preset é build-only).

### Env vars a definir na Vercel (Project → Settings → Environment Variables)
Marcar todas para **Production** (e Preview, se usar). A Vercel as expõe tanto no
build quanto no runtime — necessário porque as `VITE_*` são lidas em build e as
demais em runtime pela função de servidor.

| Variável | Valor | Tipo |
|---|---|---|
| `VITE_SUPABASE_URL` | https://npbqewavtpptqzzxoqzr.supabase.co | pública |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | sb_publishable_SUqI9g... | pública |
| `VITE_SUPABASE_PROJECT_ID` | npbqewavtpptqzzxoqzr | pública |
| `SUPABASE_URL` | https://npbqewavtpptqzzxoqzr.supabase.co | pública |
| `SUPABASE_PUBLISHABLE_KEY` | sb_publishable_SUqI9g... | pública |
| `SUPABASE_SERVICE_ROLE_KEY` | (Dashboard → Settings → API → service_role) | **secret** |
| `RESEND_API_KEY` | (resend.com → API Keys) | **secret** |
| `RESEND_FROM` | contato@senaconsulting.app | pública |
| `RESEND_WEBHOOK_SECRET` | `whsec_...` (resend.com → Webhooks) — opcional, p/ supressão de bounces | **secret** |
| `PUBLIC_SITE_URL` | https://www.senaconsulting.app | pública |

> `SUPABASE_DB_PASSWORD` NÃO vai pra Vercel (é só pra CLI de migrations).

### Passo a passo (ordem segura, sem downtime)
1. **Conta/projeto na Vercel** → "Add New Project" → importar o repo do GitHub
   `fdesena/sena-ai-consulting`. A Vercel lê o `vercel.json` automaticamente.
2. **Definir as env vars** da tabela acima.
3. **Deploy** → testar no URL temporário `*.vercel.app`: homepage, `/diagnostico`
   (submit), login admin em `/auth`, e um email de teste.
4. **Verificar domínio no Resend**: `senaconsulting.app` precisa estar verificado
   em resend.com → Domains (o envio já funcionou no teste local, então provável OK).
5. **Domínio (GoDaddy)**: na Lovable, remover o domínio custom `senaconsulting.app`;
   na Vercel, adicionar `senaconsulting.app`; no GoDaddy, apontar o DNS para os
   registros que a Vercel indicar (geralmente `A @ → 76.76.21.21` e
   `CNAME www → cname.vercel-dns.com`).
6. **Cron**: a URL em `supabase/setup_email_queue_cron.sql` já é
   `https://senaconsulting.app/...` — funciona assim que o domínio apontar pra Vercel.
   Enquanto testa no `*.vercel.app`, dá pra disparar o endpoint da fila manualmente.
7. **Desligar a Lovable**: desconectar o sync GitHub↔Lovable e arquivar o projeto.
8. **Admin**: já criados (`felipesmsena@gmail.com` e `admin@senaconsulting.app`,
   senha `admin123sena` — trocar após primeiro login).

## Reaplicar Vault + Cron (referência)

O secret do Vault carrega a service_role key e por isso NÃO é versionado. Para
(re)criar, conectado ao banco novo:
```sql
delete from vault.secrets where name = 'email_queue_service_role_key';
select vault.create_secret('<SERVICE_ROLE_KEY>', 'email_queue_service_role_key', 'Service role key for email queue cron');
```
Depois rode `supabase/setup_email_queue_cron.sql` para agendar o job (`process-email-queue`, a cada 10s).

## Webhook de bounce/complaint do Resend (supressão automática)

`src/routes/lovable/email/suppression.ts` foi reescrito como **webhook do Resend**
(assinatura via Svix, lib `svix`). Para ativar a supressão automática de
bounces/spam:

1. **resend.com → Webhooks → Add Endpoint**:
   `https://www.senaconsulting.app/lovable/email/suppression`
2. Eventos: marcar **`email.bounced`** e **`email.complained`**.
3. Copiar o **Signing Secret** (`whsec_...`) e adicioná-lo na Vercel como
   `RESEND_WEBHOOK_SECRET` (Production) → **Redeploy**.

Sem essa env var o endpoint responde 500 (fail-closed). O unsubscribe self-service
(`/email/unsubscribe`) já funciona independentemente.

## Limpeza de Lovable já feita

- Removidos os pacotes mortos `@lovable.dev/email-js` e `@lovable.dev/webhooks-js`,
  e a pasta `.lovable/`. (`@lovable.dev/vite-tanstack-config` **permanece** — é
  necessária para o build.)
- Removido `transactional/preview.ts` (era preview de templates do dashboard da Lovable).
- As rotas sob `/lovable/email/...` mantêm esse prefixo de propósito (o cron e o
  fluxo do diagnóstico apontam para elas) — é só cosmético.

## Outras observações

- **Emails de auth do Supabase** (reset de senha etc.) usam o serviço padrão do
  Supabase no projeto novo. Para produção, dá pra configurar SMTP custom (Resend)
  em Auth → SMTP Settings. Opcional — o fluxo de credenciais do diagnóstico já vai
  pelo pipeline Resend, não pelos emails de auth.
