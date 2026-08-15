-- =========================================================
-- WhatsApp Business (Embedded Signup) — conexões por cliente
-- Cada usuário conecta o próprio WABA via Meta Embedded Signup.
-- Token de acesso fica em tabela separada, sem policy nenhuma para
-- authenticated: só o service_role (rotas de servidor) lê/escreve.
-- =========================================================

CREATE TABLE IF NOT EXISTS public.whatsapp_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  waba_id TEXT NOT NULL,
  phone_number_id TEXT,
  display_phone_number TEXT,
  verified_name TEXT,
  business_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, waba_id)
);

CREATE INDEX IF NOT EXISTS whatsapp_connections_user_idx
  ON public.whatsapp_connections (user_id);

GRANT SELECT ON public.whatsapp_connections TO authenticated;
GRANT ALL ON public.whatsapp_connections TO service_role;

ALTER TABLE public.whatsapp_connections ENABLE ROW LEVEL SECURITY;

-- Usuário enxerga a própria conexão; admin enxerga todas. Escrita só via service_role.
DROP POLICY IF EXISTS "Users see own whatsapp connections" ON public.whatsapp_connections;
CREATE POLICY "Users see own whatsapp connections"
  ON public.whatsapp_connections FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- Segredos da conexão (token de acesso criptografado). RLS habilitado
-- sem nenhuma policy para authenticated: fica inacessível via anon/authenticated,
-- só o service_role (que ignora RLS) consegue ler/escrever.
-- =========================================================
CREATE TABLE IF NOT EXISTS public.whatsapp_connection_secrets (
  connection_id UUID NOT NULL PRIMARY KEY REFERENCES public.whatsapp_connections(id) ON DELETE CASCADE,
  encrypted_access_token TEXT NOT NULL,
  token_iv TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.whatsapp_connection_secrets TO service_role;

ALTER TABLE public.whatsapp_connection_secrets ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- Eventos crus do webhook (mensagens, status). Auditoria/inbox.
-- Escrita só via service_role; leitura exposta por rota de API própria
-- (não via RLS direta) para evitar subquery de policy mais arriscada.
-- =========================================================
CREATE TABLE IF NOT EXISTS public.whatsapp_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  waba_id TEXT NOT NULL,
  connection_id UUID REFERENCES public.whatsapp_connections(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS whatsapp_events_waba_idx
  ON public.whatsapp_events (waba_id);
CREATE INDEX IF NOT EXISTS whatsapp_events_connection_idx
  ON public.whatsapp_events (connection_id);

GRANT ALL ON public.whatsapp_events TO service_role;

ALTER TABLE public.whatsapp_events ENABLE ROW LEVEL SECURITY;
