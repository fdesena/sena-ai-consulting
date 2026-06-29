
# Migração Lovable Cloud → Supabase próprio

## Ação imediata (você, antes de qualquer coisa)

1. **Rotacionar a senha do banco** que você colou no chat: Supabase Dashboard → Project Settings → Database → "Reset database password". Considere a atual comprometida.
2. **Não compartilhar** a Service Role Key aqui — vou pedir só quando for usar, e ela será gravada via `add_secret` (nunca em código).

---

## Fase 1 — Exportar tudo do projeto atual (Lovable Cloud)

Faço aqui no projeto atual:

- **Schema**: gerar SQL com todas as tabelas (`blog_posts`, `diagnostico_respostas`, `profiles`, `user_roles`, `page_events`, `email_*`, `suppressed_emails`), enums (`app_role`), funções (`has_role`, `claim_seed_admin`, `handle_new_user`, `touch_updated_at`, `enqueue_email`, etc.), triggers, RLS policies e GRANTs.
- **Dados**: exportar cada tabela em CSV para `/mnt/documents/` (única forma de export permitida na Cloud).
- **Storage**: listar objetos do bucket `avatars` e baixar para reupload posterior.
- **Auth users**: exportar lista de usuários (id, email, metadata, created_at) via Admin API. ⚠️ Senhas com hash **não** são exportáveis — todos usuários precisarão redefinir senha no novo projeto (envio de magic link em massa).

Entrego um pacote ZIP em `/mnt/documents/migration-export.zip` com tudo.

## Fase 2 — Preparar seu Supabase novo (`npbqewavtpptqzzxoqzr`)

Você executa no dashboard do seu Supabase:

1. Rodar o `schema.sql` exportado no SQL Editor (cria tabelas, RLS, funções, triggers, GRANTs).
2. Importar os CSVs em cada tabela (Table Editor → Import).
3. Criar bucket `avatars` (privado) e reaplicar as policies de storage.
4. Em Auth → Providers: habilitar Email e Google (mesma config do projeto atual).
5. Em Auth → URL Configuration: adicionar `https://senaconsulting.app` e a URL de preview do novo projeto.
6. Importar usuários via Admin API (script que te entrego) e disparar reset de senha em massa.

## Fase 3 — Criar o novo projeto Lovable (remix sem Cloud)

1. Você clica em "Remix" neste projeto e, no novo projeto, **não ativa Lovable Cloud**.
2. No novo projeto, conectar seu Supabase via integração nativa do Supabase (não Cloud). Isso faz a Lovable injetar `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` apontando para `npbqewavtpptqzzxoqzr` e regenerar `src/integrations/supabase/types.ts`.
3. Configurar secrets no novo projeto:
   - `SUPABASE_SERVICE_ROLE_KEY` (via `add_secret`)
   - `LOVABLE_API_KEY` (se for usar Lovable AI) ou alternativa
   - Recriar conexão do Google Search Console
4. Reapontar domínio `senaconsulting.app` para o novo projeto Lovable.
5. Republicar o site.

## Fase 4 — Validação

- Login com usuário admin (`senaconsulting@gmail.com`) → confirma `claim_seed_admin` funcionando.
- Submeter um diagnóstico de teste end-to-end (form → DB → email).
- Conferir blog posts e analytics aparecendo no painel admin.
- Verificar upload de avatar no storage novo.

---

## Pontos importantes / trade-offs

- **Senhas dos usuários se perdem.** Supabase não exporta password hashes. Todos precisarão "Esqueci minha senha" no primeiro acesso. Posso preparar um email automatizado avisando.
- **Este projeto atual continua existindo** na Cloud (não dá pra desconectar). Recomendo arquivá-lo depois que o novo estiver no ar, mantendo só como backup por algumas semanas.
- **Histórico do chat / commits da Lovable** não migra para o novo projeto (apenas o código).
- **Email infra (`notify.senaconsulting.app`)** precisa ser reconfigurada no novo projeto.

---

## Detalhe técnico

A Fase 1 (export) eu consigo executar inteiramente daqui usando `psql` + `supabaseAdmin` (Auth Admin API + Storage API). Já as Fases 2 e 3 dependem de ações suas no dashboard do Supabase novo e no criador de projeto Lovable — eu te entrego os scripts/SQL prontos e te guio passo a passo.

**Próximo passo se você aprovar:** rotacione a senha do banco no Supabase, confirme, e eu começo pela Fase 1 gerando o pacote de export.
