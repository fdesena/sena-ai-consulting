-- =========================================================
-- Cadastros de prestadores e pagadores reutilizáveis no app "invoice".
-- Somente o dono enxerga, cria, edita e apaga. Salvar com o mesmo nome
-- (user_id, kind, label) atualiza o cadastro existente.
-- Sem bypass de admin: a tabela guarda endereço e dados fiscais.
-- =========================================================
CREATE TABLE IF NOT EXISTS public.invoice_parties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('provider', 'payer')),
  label TEXT NOT NULL CHECK (length(btrim(label)) > 0),
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, kind, label)
);

CREATE INDEX IF NOT EXISTS invoice_parties_user_kind_created_idx
  ON public.invoice_parties (user_id, kind, created_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_parties TO authenticated;
GRANT ALL ON public.invoice_parties TO service_role;

ALTER TABLE public.invoice_parties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner reads invoice parties" ON public.invoice_parties;
CREATE POLICY "Owner reads invoice parties"
  ON public.invoice_parties FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Owner inserts invoice parties" ON public.invoice_parties;
CREATE POLICY "Owner inserts invoice parties"
  ON public.invoice_parties FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Owner updates invoice parties" ON public.invoice_parties;
CREATE POLICY "Owner updates invoice parties"
  ON public.invoice_parties FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Owner deletes invoice parties" ON public.invoice_parties;
CREATE POLICY "Owner deletes invoice parties"
  ON public.invoice_parties FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
