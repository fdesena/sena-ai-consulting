-- =========================================================
-- Invoices geradas na área logada (app "invoice").
-- Somente o dono enxerga, cria e apaga; não há UPDATE (editar = duplicar).
-- Sem bypass de admin: a tabela guarda endereço e dados fiscais.
-- =========================================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('pt', 'en')),
  number TEXT NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  provider JSONB NOT NULL,
  payer JSONB NOT NULL,
  description TEXT NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('USD', 'EUR', 'BRL', 'GBP')),
  amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS invoices_user_created_idx
  ON public.invoices (user_id, created_at DESC);

GRANT SELECT, INSERT, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner reads invoices" ON public.invoices;
CREATE POLICY "Owner reads invoices"
  ON public.invoices FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Owner inserts invoices" ON public.invoices;
CREATE POLICY "Owner inserts invoices"
  ON public.invoices FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Owner deletes invoices" ON public.invoices;
CREATE POLICY "Owner deletes invoices"
  ON public.invoices FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
